import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketService } from 'src/socket/socket.service';
import { UserService } from 'src/user/user.service'
import { GameInstance } from './GameInstance';
import { GameState, Harkinian } from './GameState';
import * as config from './config.json';
import { MatchesService } from 'src/matches/matches.service';

export class GameQueue
{
		public timestamp:	number;

	constructor(
		public socket:		Socket,
		public name:		string|null,
		public isBasic:		boolean
	){ this.timestamp = Date.now(); }
}

@Injectable()
export class GameService 
{
	private GameLobby: Map<string, GameState>;
	private gameQueue: Map<string, GameQueue>;

	constructor(
	private readonly socketService: SocketService,
	private readonly userService: UserService,
	private readonly matchService: MatchesService,
	) 
	{
		this.GameLobby = new Map<string, GameState>;
		this.gameQueue = new Map<string, GameQueue>;
	}

	private getGameState(player1Id: string, player2Id: string): GameState | undefined
	{
		return this.GameLobby.get(player1Id + ":" +player2Id);
	}

	public add2GameQueue(socket: Socket, name: string|null, isBasic: boolean)
	{
		this.gameQueue.set(socket.id, new GameQueue(socket, name, isBasic));
	}

	public removeFromGameQueue(socketId: string)
	{
		this.gameQueue.delete(socketId);
	}

	public dumpQueue(): void
	{
		let i = 1;
		for (const [key , value] of this.gameQueue)
		{
			console.log(i + ') Backend dump queue: ' + key);
			i++;
		}
	}

	public takeFromGameQueue(socketId: string): GameQueue|null
	{
		let instance = this.gameQueue.get(socketId);
		this.gameQueue.delete(socketId);
		if (typeof instance !== 'undefined')
			return instance;
		return null;
	}

	public isInGameQueue(socketId: string): boolean
	{
		return this.gameQueue.has(socketId);
	}

	public timoutQueue(): void
	{
		let now = Date.now();

		for (const [, value] of this.gameQueue)
		{
			if (now > value.timestamp + config.mmTimeout ||
				!value.socket.connected)
			{
				value.socket.emit('matchmaking', 'operation timed out');
				this.gameQueue.delete(value.socket.id);
			}
		}
	}

	public look4match(socket: Socket,name: string|null, isBasic: boolean): GameQueue|null
	{
		for (const [key, value] of this.gameQueue) 
		{
			if (name == null && value.isBasic == isBasic)
				return value;
			if (name != null && name == value.name)
				return value;
		}
		this.add2GameQueue(socket, name, isBasic);
		return null;
	}

	public initBasicGame(player1Id: string, player2Id: string): void
	{
		this.GameLobby.set(player1Id + ":" + player2Id, new GameState(false, new GameInstance));
	}

	public initExtendedGame(player1Id: string, player2Id: string): void
	{
		this.GameLobby.set(player1Id + ":" + player2Id, new GameState(true, new GameInstance));
	}

	private deleteGame(player1Id: string, player2Id: string): void
	{
		this.GameLobby.delete(player1Id +":"+ player2Id);;
	}

	public changeInGameStatus(userId: number, inGame: boolean)
	{
		this.userService.updateUserViaId(userId, { inGame });
	}

	public endGame(player1: Socket, player2: Socket): void
	{
		let looser: Socket;
		let winner: Socket;
		let winnerId: number;

		const gameInstance = this.getGameState(player1.id, player2.id)?.getGameInstance();
		const player1Id = this.socketService.getUserId(player1.id);
		const player2Id = this.socketService.getUserId(player2.id);
		this.changeInGameStatus(player1Id, false);
		this.changeInGameStatus(player2Id, false);
		const result = gameInstance!.getResult();

		if (result.homeScore < result.awayScore) {
			winnerId = player2Id;
			winner = player2;
			looser = player1;
		} else {
			winnerId = player1Id;
			winner = player1;
			looser = player2;
		}

		winner.emit('EndGame', "You won!");
		looser.emit('EndGame', "You lost!");

		const matchData = { ...result, homePlayerId: player1Id, awayPlayerId: player2Id, winnerId}
		this.matchService.createMatch(matchData);
		this.deleteGame(player1.id, player2.id);
	}

	public startGame(player1: Socket, player2: Socket): void
	{
		let gameState = this.getGameState(player1.id, player2.id);
		if (!gameState || player1 == player2)
		{
			console.log("BACKEND: error: no GameState");
			return;
		}

		const homePlayerId = this.socketService.getUserId(player1.id);
		const awayPlayerId = this.socketService.getUserId(player2.id);
		this.changeInGameStatus(homePlayerId, true);
		this.changeInGameStatus(awayPlayerId, true);
		const gameIntervall = setInterval( () => {
			player1.on("keypress", (key) => {
				let paddleSpeed: number = 1;
				if (key === "ARROWUP+SPACE" || key === "ARROWDOWN+SPACE")
					paddleSpeed = 2;
				if (key === "ARROWUP" || key === "ARROWUP+SPACE")
					gameState?.setPaddleDirection(1, -paddleSpeed);
				else if (key === "ARROWDOWN" || key === "ARROWDOWN+SPACE")
					gameState?.setPaddleDirection(1, paddleSpeed);
				else
					gameState?.setPaddleDirection(1, 0);
			});
			player2.on("keypress", (key) => {
				let paddleSpeed: number = 1;
				if (key === "ARROWUP+SPACE" || key === "ARROWDOWN+SPACE")
					paddleSpeed = 2;
				if (key === "ARROWUP" || key === "ARROWUP+SPACE")
					gameState?.setPaddleDirection(2, -paddleSpeed);
				else if (key === "ARROWDOWN" || key === "ARROWDOWN+SPACE")
					gameState?.setPaddleDirection(2, paddleSpeed);
				else
					gameState?.setPaddleDirection(2, 0);
			});

			gameState?.calcNewPosition();
			if (gameState?.getGameInstance().isFinished())
			{
				this.endGame(player1, player2);
				clearInterval(gameIntervall);
				return;
			}
			if (gameState?.getGameInstance().isInterrupted())
			{
				player1.emit('EndGame', "Opponent Disconnected, you won by 3-0");
				player2.emit('EndGame', "Opponent Disconnected, you won by 3-0");
				clearInterval(gameIntervall);
				return;
			}

			player1.emit('GameLoop', 
			{
				'score1': gameState?.getGameInstance().getScore1(),
				'score2': gameState?.getGameInstance().getScore2(),
				'paddle1': gameState?.paddle1.position,
				'paddle2': gameState?.paddle2.position,
				'ball': gameState?.ball.position,
				'ball2': gameState?.ball2.position,
				'ball2lock': gameState?.ball2.isUnlocked,
				'fox': {
					'isUnlocked': gameState?.fox.isUnlocked,
					'isEvil': gameState?.fox.isEvil,
					'isEnraged': gameState?.fox.isEnraged,
					'hasSizeOf': gameState?.fox.hasSizeOf,
					'triggeredEnrage': gameState?.fox.triggeredEnrage,
					'pos': gameState?.fox.position
				},
				'collisionFoxPaddle1': gameState?.collisions.fox_paddle1,
				'collisionFoxPaddle2': gameState?.collisions.fox_paddle2,
				'harkinian': {
					'pos': gameState?.harkinian.position
				},
				'triggers': {
					'triggeredGnome': gameState?.triggers.triggeredGnome,
					'triggeredHarkinian': gameState?.triggers.triggeredHarkinian,
					'triggeredPopup': gameState?.triggers.triggeredPopup
				}
			});
			player2.emit('GameLoop', 
			{
				'score1': gameState?.getGameInstance().getScore1(),
				'score2': gameState?.getGameInstance().getScore2(),
				'paddle1': gameState?.paddle1.position,
				'paddle2': gameState?.paddle2.position,
				'ball': gameState?.ball.position,
				'ball2': gameState?.ball2.position,
				'ball2lock': gameState?.ball2.isUnlocked,
				'fox': {
					'isUnlocked': gameState?.fox.isUnlocked,
					'isEvil': gameState?.fox.isEvil,
					'isEnraged': gameState?.fox.isEnraged,
					'hasSizeOf': gameState?.fox.hasSizeOf,
					'triggeredEnrage': gameState?.fox.triggeredEnrage,
					'pos': gameState?.fox.position
				},
				'collisionFoxPaddle1': gameState?.collisions.fox_paddle1,
				'collisionFoxPaddle2': gameState?.collisions.fox_paddle2,
				'harkinian': {
					'pos': gameState?.harkinian.position
				},
				'triggers': {
					'triggeredGnome': gameState?.triggers.triggeredGnome,
					'triggeredHarkinian': gameState?.triggers.triggeredHarkinian,
					'triggeredPopup': gameState?.triggers.triggeredPopup
				}
			});
		}, 1000 / config.fps);

	}

	private setDisconnectedResult(leavingPlayer: string, key: string) {
		let winnerId: number;

		const players = key.split(':');
		const result = this.getGameState(players[0], players[1])?.getGameInstance().getResult()
		if (result) {
			const homePlayerId = this.socketService.getUserId(players[0]);
			const awayPlayerId = this.socketService.getUserId(players[1]);
			this.changeInGameStatus(homePlayerId, false);
			this.changeInGameStatus(awayPlayerId, false);

			if (players[0] === leavingPlayer) {
				result.homeScore = 0;
				result.awayScore = 3;
				winnerId = awayPlayerId;
			} else {
				result.homeScore = 3;
				result.awayScore = 0;
				winnerId = homePlayerId;
			}

			const matchData = { ...result, homePlayerId, awayPlayerId, winnerId}
			this.matchService.createMatch(matchData);
		}
	}

	public handleDisconnect(client: Socket) {
		const userId = client.id;
		let gameKeyToRemove: string | null = null;

		// Loop through the GameLobby to find if the disconnecting user is in a game
		this.GameLobby.forEach((gameState, key) => {
			const players = key.split(':');
			if (players.includes(userId)) {
				// Found the game the user is in
				this.getGameState(players[0], players[1])?.getGameInstance().setInterrupted();
				gameKeyToRemove = key;
				this.setDisconnectedResult(userId, key);
				this.GameLobby.delete(gameKeyToRemove);
				return;
			}
		});
		return;
	}
}