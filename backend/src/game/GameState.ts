import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { SocketService } from 'src/socket/socket.service';
import { UserService } from 'src/user/user.service'
import { User } from '@prisma/client';
import { GameInstance } from './GameInstance';
import * as config from './config.json';

export class Coordinate {
	constructor(
		public x: number,
		public y: number
	) {}
}

export class Fox {
	public isUnlocked:				boolean = false;
	public isEvil:					boolean = false;
	public isEnraged:				boolean = false;
	public hasSizeOf:				number = config.fox.minSize;
	public timeStamp:				number = 0;
	public timestampLastAppeased: 	number = 0;
	public timeTillEnraged:			number = 10000;
	public triggeredEnrage:			number = 0;
	public paddleTime:				number = 0;
	public sticking:				number = 0;
	public velocity:				number = config.fox.minVelocity;
	public position:				Coordinate = new Coordinate(config.game_canvas.width / 2, config.game_canvas.height / 2);

	constructor(
		public direction:	Coordinate
	) { 
		this.timeStamp= Date.now();
	}
}

export class Paddle {
	public direction: 	number = 0;
	public isImmobile:	boolean = false;
	constructor(
		public position: Coordinate,
		public height: number
	) {}
}

export class Harkinian
{
	public position:	Coordinate = new Coordinate(config.game_canvas.width / 2, config.game_canvas.height / 2);
}

export class Triggerables
{
	public triggeredGnome:		boolean = false;
	public triggeredHarkinian:	boolean = false;
	public triggeredPopup:		boolean = false;
}

export class Ball 
{
	public position: Coordinate = new Coordinate(config.game_canvas.width / 2, config.game_canvas.height / 2);
	public radius: number = config.ball.radius;
	public velocity: number;

	constructor(
		public direction: Coordinate,
		public isUnlocked: boolean,
		public readonly start_velocity: number) 
		{
			this.velocity = start_velocity;
		}
}

export class Collisions
{
	public fox_ball1: 	string = "";
	public fox_ball2:	string = "";
	public fox_paddle1:	boolean = false;
	public fox_paddle2:	boolean = false;
	public fox_wall:	string = "";
}

export class GameState 
{
	public paddle1:		Paddle;
	public paddle2:		Paddle;
	public ball:		Ball;
	public ball2:		Ball;
	public fox: 		Fox;
	public harkinian:	Harkinian;
	public triggers:	Triggerables;
	public collisions:	Collisions;
	public winner:		number;
	public roundStart:	number;
	public speedIncCnt: number;

	constructor(
		private isExtended: boolean,
		private instance: GameInstance)
   {
		let paddle_height: number = config.paddle.height;
		this.paddle1 = new Paddle(new Coordinate(config.paddle.buffer, (config.game_canvas.height - config.paddle.height) / 2), paddle_height);
		this.paddle2 = new Paddle(new Coordinate(config.game_canvas.width - config.paddle.buffer - config.paddle.width, (config.game_canvas.height - config.paddle.height) / 2), paddle_height);
		this.ball = new Ball(this.calcRandomDirection(Math.random() * 2), true, config.ball.velocity);
		this.ball2 = new Ball(this.calcRandomDirection(Math.random() * 2), false, config.ball.velocity);
		this.fox = new Fox(this.calcRandomDirection(Math.random() * 2));
		this.harkinian = new Harkinian();
		this.triggers = new Triggerables();
		this.collisions = new Collisions();
		this.winner = 0;
		this.roundStart = Date.now();
		this.speedIncCnt = 0;
	}

	public getGameInstance(): GameInstance
	{
		return this.instance;
	}

	public calcRandomDirection(round: number) : Coordinate {
		let x: number = (round % 2 === 1) ? 1 : -1;
		let y: number = (Math.random() * 2) - 1;
		return new Coordinate(x, y);
	}

	public async calcNewPosition() : Promise<void> {
		if (!this.instance.isStarted() && this.instance.getTimeDiff() > config.startTime)
			this.instance.startGame();
		if (this.instance.isFinished() || !this.instance.isStarted())
			return;
		if (this.instance.hasScored())
		{
			this.resetGameState();
			this.instance.addRound();
			this.winner = this.instance.whoWon();
			if (this.winner)
				this.instance.finishGame();
			return;
		}
		if (this.isExtended)
			this.extendedVersion();
		this.ball = this.calcBallPosition(this.ball);
		this.calcPaddlePosition(this.paddle1);
		this.calcPaddlePosition(this.paddle2);
	}

	public extendedVersion(): void
	{
		this.adjustBallVelocityDuringRound();
		this.triggerTriggerables();
		this.controlGnome();
		this.controlHarkinian();
		this.unlockBall();
		this.unlockFox();
		this.collisionCheck();
		if (this.ball2.isUnlocked)
			this.ball2 = this.calcBallPosition(this.ball2);
		if (this.fox.isUnlocked)
		{
			// this.checkFoxMood();
			// this.isEnragedFox();
			// this.calcFoxPosition();
			// this.unstickFoxFromPaddle();
			// this.freePaddles();
			this.moveFox(Date.now());
			this.foxPaddleBehavior();
			if (this.fox.triggeredEnrage > 0)
				this.fox.triggeredEnrage--;
			//this.foxBallCollission();
		}

	}

	public collisionCheck_foxBall(ballX: number, ballY: number, foxWidth: number, foxHeight: number): string
	{
		let collision = "";
		
		// Check "up" (with 3 pixels error margin)
		if (ballX >= this.fox.position.x && ballX <= this.fox.position.x + foxWidth &&
			ballY >= this.fox.position.y - 3 && ballY <= this.fox.position.y + 10)
			//ballY >= foxPosY - 3 && ballY <= foxPosY + 3)
		{
			collision = "up";
		}
		// Check "down" (with 3 pixels error margin)
		else if (ballX >= this.fox.position.x && ballX <= this.fox.position.x + foxWidth &&
				 ballY >= this.fox.position.y + foxHeight - 10 && ballY <= this.fox.position.y + foxHeight + 3)
				 //ballY >= foxPosY + imageFoxBad.height - 3 && ballY <= foxPosY + imageFoxBad.height + 3)
		{
			collision = "down";
		}
		// Check "left" (with 3 pixels error margin)
		else if (ballY >= this.fox.position.y && ballY <= this.fox.position.y + foxHeight &&
				 ballX >= this.fox.position.x - 3 && ballX <= this.fox.position.x + 10)
				 //ballX >= foxPosX - 3 && ballX <= foxPosX + 3)
		{
			collision = "left";
		}
		// Check "right" (with 3 pixels error margin)
		else if (ballY >= this.fox.position.y && ballY <= this.fox.position.y + foxHeight &&
				 ballX >= this.fox.position.x + foxWidth - 10 && ballX <= this.fox.position.x + foxWidth + 3)
				 //ballX >= foxPosX + imageFoxBad.width - 3 && ballX <= foxPosX + imageFoxBad.width + 3)
		{
			collision = "right";
		}
		return collision;
	}

	public collisionCheck_foxPaddle(paddleX: number, paddleY: number, foxWidth: number, foxHeight: number): boolean
	{
		let collision = false;
		
		if (paddleX === 0)
		{
			if (this.fox.position.y + foxHeight >= paddleY && this.fox.position.y <= paddleY + config.paddle.height &&
				this.fox.position.x <= paddleX + config.paddle.width)
			{
				collision = true;
			}
		}
		else
		{
			if (this.fox.position.y + foxHeight >= paddleY && this.fox.position.y <= paddleY + config.paddle.height &&
				this.fox.position.x + foxWidth >= paddleX)
			{
				collision = true;
			}
		}
		return collision;
	}

	public collisionCheck_foxWall(foxWidth: number, foxHeight: number): string
	{
		let collision = "";
		
		if (this.fox.position.x + (this.fox.velocity * this.fox.direction.x) <= 0)
		{
			collision = "left";
			this.fox.position.x = 1;
		}
		else if (this.fox.position.x + foxWidth + (this.fox.velocity * this.fox.direction.x) >= config.game_canvas.width)
		{
			collision = "right";
			this.fox.position.x = config.game_canvas.width - foxWidth - 1;
		}
		else if (this.fox.position.y + (this.fox.velocity * this.fox.direction.y) <= 0)
		{
			collision = "up";
			this.fox.position.y = 1;
		}
		else if (this.fox.position.y + foxHeight + (this.fox.velocity * this.fox.direction.y) >= config.game_canvas.height)
		{
			collision = "down";
			this.fox.position.y = config.game_canvas.height - foxHeight - 1;
		}
		return collision;
	}

	public collisionCheck(): void
	{
		if (this.fox.isUnlocked === true)
		{
			if (this.fox.isEnraged === true)
			{
				var foxWidth = config.fox.maxSize;
				var foxHeight = config.fox.maxSize;
			}
			else
			{
				var foxWidth = config.fox.minSize;
				var foxHeight = config.fox.minSize;
			}

			this.collisions.fox_ball1 = this.collisionCheck_foxBall(this.ball.position.x, this.ball.position.y, foxWidth, foxHeight);
			this.collisions.fox_ball2 = this.collisionCheck_foxBall(this.ball2.position.x, this.ball2.position.y, foxWidth, foxHeight);
			this.collisions.fox_paddle1 = this.collisionCheck_foxPaddle(this.paddle1.position.x, this.paddle1.position.y, foxWidth, foxHeight);
			this.collisions.fox_paddle2 = this.collisionCheck_foxPaddle(this.paddle2.position.x, this.paddle2.position.y, foxWidth, foxHeight);
			this.collisions.fox_wall = this.collisionCheck_foxWall(foxWidth, foxHeight);
		}
	}

	public moveFox(timestamp: number): void
	{
		if (this.fox.isUnlocked === true)
		{
			if (this.fox.sticking === 1)
			{
				if (Math.floor(Math.random() * 100) === 42)
				{
					this.fox.timestampLastAppeased = timestamp;
					this.fox.timeTillEnraged = 10000 + Math.floor(Math.random() * 10000);
					this.fox.sticking = 0;
					this.fox.isEnraged = false;
					this.fox.isEvil = false;
					this.fox.velocity = config.fox.minVelocity + (this.instance.getRound() / 20);
				}
			}
			else if (this.fox.isEnraged)
			{
				if (Math.floor(Math.random() * 100) === 42)
				{
					this.fox.direction.x = -this.fox.direction.x;
				}
				if (Math.floor(Math.random() * 100) === 42)
				{
					this.fox.direction.y = -this.fox.direction.y;
				}
				this.fox.position.x = this.fox.position.x + (this.fox.velocity * this.fox.direction.x);
				this.fox.position.y = this.fox.position.y + (this.fox.velocity * this.fox.direction.y);
				if (this.collisions.fox_paddle1 === true || this.collisions.fox_paddle2 === true)
				{
					this.fox.sticking = 1;
					this.fox.velocity = 0;
					// fox_sounds_evil();
				}
			}
			else if (this.fox.isEvil)
			{
				this.fox.position.x = this.fox.position.x + (this.fox.velocity * this.fox.direction.x);
				this.fox.position.y = this.fox.position.y + (this.fox.velocity * this.fox.direction.y);
				if (this.collisions.fox_paddle1 === true || this.collisions.fox_paddle2 === true)
				{
					this.fox.sticking = 1;
					this.fox.velocity = 0;
					// fox_sounds_evil();
				}
				if (this.fox.sticking === 0 && Math.floor(Math.random() * 1000) % 100 === 0)
				{
					this.fox.isEvil = false;
				}
				if (this.fox.sticking === 0 && timestamp - this.fox.timestampLastAppeased >= this.fox.timeTillEnraged)
				{
					// audioFoxEnrage.current.play();
					this.fox.triggeredEnrage = 5;
					this.fox.isEnraged = true;
					this.fox.isEvil = true;
					this.fox.velocity = config.fox.maxVelocity;
				}
			}
			else
			{
				this.fox.position.x = this.fox.position.x + (this.fox.velocity * this.fox.direction.x);
				this.fox.position.y = this.fox.position.y + (this.fox.velocity * this.fox.direction.y);
				if (this.collisions.fox_paddle1 === true)
				{
					this.fox.direction.x = 1;
					this.fox.timestampLastAppeased = timestamp;
					this.fox.timeTillEnraged = 10000 + Math.floor(Math.random() * 10000);
					// fox_sounds_good();
				}
				else if (this.collisions.fox_paddle2 === true)
				{
					this.fox.direction.x = -1;
					this.fox.timestampLastAppeased = timestamp;
					this.fox.timeTillEnraged = 10000 + Math.floor(Math.random() * 10000);
					// fox_sounds_good();
				}
				if (Math.floor(Math.random() * 1000) % 100 === 0)
				{
					this.fox.isEvil = true;
				}
				if (this.fox.sticking === 0 && timestamp - this.fox.timestampLastAppeased >= this.fox.timeTillEnraged)
				{
					// audioFoxEnrage.current.play();
					this.fox.triggeredEnrage = 5;
					this.fox.isEnraged = true;
					this.fox.isEvil = true;
					this.fox.velocity = config.fox.maxVelocity;
				}
			}
			
			if (this.collisions.fox_wall === "up")
			{
				this.fox.position.y++;
				this.fox.direction.y = -this.fox.direction.y;
			}
			else if (this.collisions.fox_wall === "down")
			{
				this.fox.position.y--;
				this.fox.direction.y = -this.fox.direction.y;
			}
			else if (this.collisions.fox_wall === "left")
			{
				this.fox.position.x++;
				this.fox.direction.x = -this.fox.direction.x;
			}
			else if (this.collisions.fox_wall === "right")
			{
				this.fox.position.x--;
				this.fox.direction.x = -this.fox.direction.x;
			}
		}
		else
		{
			this.fox.timestampLastAppeased = timestamp;
		}
	}

	public adjustBallVelocityDuringRound(): void
	{
		let timeNow: number = Date.now();

		if (timeNow - this.roundStart >= 1000 * this.speedIncCnt)
		{
			this.ball.velocity += 0.1;
			this.ball2.velocity += 0.1;
			this.speedIncCnt++;
		}
	}

	public foxBallCollission(): void
	{
		if (!this.fox.isUnlocked || !this.fox.isEnraged)
			return;
		let fsize = this.fox.hasSizeOf;
		//do collision logic here and let them bounce
	}

	public controlGnome(): void
	{
		if (this.triggers.triggeredGnome === true)
		{
			if (this.fox.isUnlocked)
			{
				// 50% chance to swap the first ball with the fox
				if (Math.floor(Math.random() * 100) % 2 === 0)
				{
					let tempX1 = this.ball.position.x;
					let tempY1 = this.ball.position.y;
					let tempDirX1 = this.ball.direction.x;
					let tempDirY1 = this.ball.direction.y;

					let tempX2 = this.fox.position.x;
					let tempY2 = this.fox.position.y;
					let tempDirX2 = this.fox.direction.x;
					let tempDirY2 = this.fox.direction.y;

					this.ball.position.x = tempX2;
					this.ball.position.y = tempY2;
					this.ball.direction.x = tempDirX2;
					this.ball.direction.y = tempDirY2;

					this.fox.position.x = tempX1;
					this.fox.position.y = tempY1;
					this.fox.direction.x = tempDirX1;
					this.fox.direction.y = tempDirY1;
				}
			}
			if (this.ball2.isUnlocked)
			{
				// 50% chance to swap the 2 balls
				if (Math.floor(Math.random() * 100) % 2 === 0)
				{
					let tempX1 = this.ball.position.x;
					let tempY1 = this.ball.position.y;
					let tempDirX1 = this.ball.direction.x;
					let tempDirY1 = this.ball.direction.y;

					let tempX2 = this.ball2.position.x;
					let tempY2 = this.ball2.position.y;
					let tempDirX2 = this.ball2.direction.x;
					let tempDirY2 = this.ball2.direction.y;

					this.ball.position.x = tempX2;
					this.ball.position.y = tempY2;
					this.ball.direction.x = tempDirX2;
					this.ball.direction.y = tempDirY2;

					this.ball2.position.x = tempX1;
					this.ball2.position.y = tempY1;
					this.ball2.direction.x = tempDirX1;
					this.ball2.direction.y = tempDirY1;
				}
			}
			if (this.fox.isUnlocked && this.ball2.isUnlocked)
			{
				// 50% chance to swap the fox with the second ball
				if (Math.floor(Math.random() * 100) % 2 === 0)
				{
					let tempX1 = this.ball2.position.x;
					let tempY1 = this.ball2.position.y;
					let tempDirX1 = this.ball2.direction.x;
					let tempDirY1 = this.ball2.direction.y;

					let tempX2 = this.fox.position.x;
					let tempY2 = this.fox.position.y;
					let tempDirX2 = this.fox.direction.x;
					let tempDirY2 = this.fox.direction.y;

					this.ball2.position.x = tempX2;
					this.ball2.position.y = tempY2;
					this.ball2.direction.x = tempDirX2;
					this.ball2.direction.y = tempDirY2;

					this.fox.position.x = tempX1;
					this.fox.position.y = tempY1;
					this.fox.direction.x = tempDirX1;
					this.fox.direction.y = tempDirY1;
				}
			}
		}
	}

	public controlHarkinian(): void
	{
		if (this.triggers.triggeredHarkinian === true)
		{
			let mod: number = 1;
			if (this.fox.isUnlocked)
				mod++;
			if (this.ball2.isUnlocked)
				mod++;

			let selector: number = Math.floor(Math.random() * 100) % mod;
			if (selector === 0)
			{
				this.harkinian.position.x = this.ball.position.x;
				this.harkinian.position.y = this.ball.position.y;
				this.ball.direction.x = -(this.ball.direction.x);
				this.ball.direction.y = -(this.ball.direction.y);
			}
			if (selector === 1)
			{
				this.harkinian.position.x = this.fox.position.x;
				this.harkinian.position.y = this.fox.position.y;
				this.fox.direction.x = -(this.fox.direction.x);
				this.fox.direction.y = -(this.fox.direction.y);
			}
			if (selector === 2)
			{
				this.harkinian.position.x = this.ball2.position.x;
				this.harkinian.position.y = this.ball2.position.y;
				this.ball2.direction.x = -(this.ball2.direction.x);
				this.ball2.direction.y = -(this.ball2.direction.y);
			}
		}
	}

	public triggerTriggerables(): void
	{
		if (this.instance.getScore1() + this.instance.getScore2() >= config.unlockGnomeAt)
		{
			if (Math.floor(Math.random() * 666) === 333)
				this.triggers.triggeredGnome = true;
			else
				this.triggers.triggeredGnome = false;
		}
		if (this.instance.getScore1() + this.instance.getScore2() >= config.unlockHarkinianAt)
		{
			if (Math.floor(Math.random() * 666) === 333)
				this.triggers.triggeredHarkinian = true;
			else
				this.triggers.triggeredHarkinian = false;
		}
		if (this.instance.getScore1() + this.instance.getScore2() >= config.unlockPopupsAt)
		{
			if (Math.floor(Math.random() * 666) === 333)
				this.triggers.triggeredPopup = true;
			else
				this.triggers.triggeredPopup = false;
		}
	}

	public unlockBall(): void
	{
		if (this.instance.getScore1() + this.instance.getScore2() == config.unlockSecondBallAt)
			this.ball2.isUnlocked = true;
	}

	public unlockFox(): void
	{
		if (this.instance.getScore1() + this.instance.getScore2() == config.fox.showUpWhen)
		{
			this.fox.isUnlocked = true;
			this.fox.timestampLastAppeased = Date.now();
			this.fox.timeStamp = Date.now();
			this.fox.paddleTime = Date.now();
		}
	}

	// public unstickFoxFromPaddle(): void
	// {
	// 	if (this.fox.isUnlocked === false || this.fox.isEvil === false)
	// 		return;
	// 	if ((Date.now() > config.fox.timeStick2Paddle + Math.floor(Math.random() * 1000)))
	// 	{
	// 		this.fox.isEvil = false;
	// 		this.fox.timeStamp = Date.now();
	// 		this.fox.sticking = 0;
	// 	}
	// }

	// public checkFoxMood(): void
	// {
	// 	if (!this.fox.isUnlocked)
	// 		return;
	// 	if (Date.now() > this.fox.timeStamp + config.fox.minTimeGoodEvil)
	// 	{
	// 		if (Math.random() * 100 % 42 === 0)
	// 		{
	// 			this.fox.timeStamp = Date.now();
	// 			this.fox.isEvil = true;
	// 		}
	// 		else
	// 			this.fox.isEvil = false;
	// 	}
	// }

	// public isEnragedFox(): void
	// {
	// 	if (!this.fox.isUnlocked || !this.fox.isEnraged)
	// 		return;
	// 	let rndTime = Math.random() * config.fox.getEnragedIn;
	// 	if (Date.now() < this.fox.paddleTime + config.fox.getEnragedIn + rndTime)
	// 	{
	// 		this.fox.isEnraged = true;
	// 		this.fox.velocity = config.fox.maxVelocity;
	// 		this.fox.hasSizeOf = config.fox.maxSize;
	// 	}
	// 	else
	// 		this.unrageFox;
	// }

	// public unrageFox(): void
	// {
	// 	if (!this.fox.isUnlocked || !this.fox.isEnraged)
	// 		return;
	// 	this.fox.isEnraged = false;
	// 	this.fox.velocity = config.fox.minVelocity;
	// 	this.fox.hasSizeOf = config.fox.minSize;
	// 	this.fox.isEvil = false;
	// 	this.fox.timeStamp = Date.now();
	// }

	public foxPaddleBehavior(): void
	{
		if (this.fox.isUnlocked === true)
		{
			if (this.fox.sticking === 1)
			{
				if (this.collisions.fox_paddle1 === true)
				{
					this.paddle1.isImmobile = true;
				}
				if (this.collisions.fox_paddle2 === true)
				{
					this.paddle2.isImmobile = true;
				}
			}
			else
			{
				this.paddle1.isImmobile = false;
				this.paddle2.isImmobile = false;
			}
		}
		// if (this.fox.isEvil === false)
		// 	this.fox.paddleTime = Date.now();
		// else
		// {
		// 	if (paddle == 1)
		// 		this.paddle1.isImmobile = true;
		// 	else
		// 		this.paddle2.isImmobile = true;
		// 	this.fox.velocity = 0;
		// 	this.fox.sticking = 1;
		// 	this.fox.paddleTime = Date.now() + Math.floor(Math.random() * config.fox.timeStick2Paddle);
		// }
	}

	// public freePaddles(): void
	// {
	// 	if (!this.fox.isUnlocked || this.fox.velocity == 0)
	// 		return;
	// 	if (this.fox.paddleTime < Date.now())
	// 	{
	// 		this.fox.paddleTime = Date.now();
	// 		this.paddle1.isImmobile = false;
	// 		this.paddle2.isImmobile = false;
	// 		this.fox.isEvil = false;
	// 		this.fox.velocity = config.fox.minVelocity;
	// 		this.fox.timeStamp = Date.now();
	// 	}
	// }

	// public calcFoxPosition() {
	// 	let fox_new_x: number = this.fox.position.x + Math.round(this.fox.velocity * this.fox.direction.x);
	// 	let fox_new_y: number = this.fox.position.y + Math.round(this.fox.velocity * this.fox.direction.y);

	// 	if (this.fox.sticking)
	// 		return;

	// 	if (fox_new_y - this.fox.hasSizeOf <= 0) {
	// 		fox_new_y = this.fox.hasSizeOf;
	// 		this.fox.direction.y *= -1;
	// 	} else if (fox_new_y + this.fox.hasSizeOf >= config.game_canvas.height) {
	// 		fox_new_y = config.game_canvas.height - this.fox.hasSizeOf;
	// 		this.fox.direction.y *= -1;
	// 	}
	// 	if (fox_new_x - this.fox.hasSizeOf <= 0) 
	// 	{
	// 		fox_new_x = this.fox.hasSizeOf;
	// 		this.fox.direction.x *= -1;
	// 	}
	// 	else if (fox_new_x + this.fox.hasSizeOf >= config.game_canvas.width) 
	// 	{
	// 		fox_new_x = config.game_canvas.width - this.fox.hasSizeOf;
	// 		this.fox.direction.x *= -1;
	// 	}
	// 	if ((fox_new_x - this.fox.hasSizeOf) <= (config.paddle.buffer + config.paddle.width)) {
	// 		if ((((fox_new_y - this.fox.hasSizeOf) > (this.paddle1.position.y + this.paddle1.height)) ||
	// 			((fox_new_y + this.fox.hasSizeOf) < this.paddle1.position.y)))
	// 		{
	// 				//do nothing
	// 		}
	// 		else
	// 		{
	// 			fox_new_x = this.paddle1.position.x + config.paddle.width + this.fox.hasSizeOf;
	// 			this.fox.direction.y = (fox_new_y - (this.paddle1.position.y + (this.paddle1.height / 2))) / (config.paddle.height / 4);
	// 			this.fox.direction.x *= -1;
	// 			this.foxPaddleBehavior(1);
	// 		}
	// 	}
	// 	else if (fox_new_x + this.fox.hasSizeOf >= (config.game_canvas.width - config.paddle.buffer - config.paddle.width))
	// 	{
	// 		if (((((fox_new_y - this.fox.hasSizeOf) > (this.paddle2.position.y + this.paddle1.height)) ||
	// 			(fox_new_y + this.fox.hasSizeOf) < this.paddle2.position.y)))
	// 		{
	// 			//do nothing
	// 		}
	// 		else
	// 		{
	// 			fox_new_x = this.paddle2.position.x - this.fox.hasSizeOf;
	// 			this.fox.direction.y = (fox_new_y - (this.paddle2.position.y + (this.paddle2.height / 2))) / (config.paddle.height / 4);
	// 			this.fox.direction.x *= -1;
	// 			this.foxPaddleBehavior(2);
	// 		}
	// 	}
	// 	// 1% chance if enraged to reverse x and/or y direction
	// 	if (this.fox.isEnraged && Math.random() * 1000 <= 10)
	// 		this.fox.direction.x *= -1;
	// 	if (this.fox.isEnraged && Math.random() * 1000 <= 10)
	// 		this.fox.direction.y *= -1;

	// 	this.fox.position.x = fox_new_x;
	// 	this.fox.position.y = fox_new_y;
	// }

	public calcBallPosition(ball: Ball) : Ball {
		let ball_new_x: number = ball.position.x + Math.round(ball.velocity * ball.direction.x);
		let ball_new_y: number = ball.position.y + Math.round(ball.velocity * ball.direction.y);

		if (ball_new_y - ball.radius <= 0)
		{
			ball_new_y = ball.radius;
			ball.direction.y *= -1;
		}
		else if (ball_new_y + ball.radius >= config.game_canvas.height)
		{
			ball_new_y = config.game_canvas.height - ball.radius;
			ball.direction.y *= -1;
		}
		if ((ball_new_x - ball.radius) <= (config.paddle.buffer + config.paddle.width))
		{
			if ((((ball_new_y - ball.radius) > (this.paddle1.position.y + this.paddle1.height)) ||
				((ball_new_y + ball.radius) < this.paddle1.position.y)) &&
				(!this.instance.hasScored()))
			{
					this.instance.scoreP2();
					this.instance.setScored();
					ball_new_x = config.game_canvas.width / 2;
					ball_new_y = config.game_canvas.height / 2;
					ball.direction = this.calcRandomDirection(this.instance.getRound());
			}
			else
			{
				ball_new_x = this.paddle1.position.x + config.paddle.width + ball.radius;
				ball.direction.y = (ball_new_y - (this.paddle1.position.y + (this.paddle1.height / 2))) / (config.paddle.height / 4);
				ball.direction.x *= -1;
			}
		}
		else if (ball_new_x + ball.radius >= (config.game_canvas.width - config.paddle.buffer - config.paddle.width))
		{
			if (((((ball_new_y - ball.radius) > (this.paddle2.position.y + this.paddle1.height)) ||
				(ball_new_y + ball.radius) < this.paddle2.position.y)) &&
				(!this.instance.hasScored()))
			{
					this.instance.scoreP1();
					this.instance.setScored();
					ball_new_x = config.game_canvas.width / 2;
					ball_new_y = config.game_canvas.height / 2;
					ball.direction = this.calcRandomDirection(this.instance.getRound());
			}
			else
			{
				ball_new_x = this.paddle2.position.x - ball.radius;
				ball.direction.y = (ball_new_y - (this.paddle2.position.y + (this.paddle2.height / 2))) / (config.paddle.height / 4);
				ball.direction.x *= -1;
			}
		}
		// if (Math.abs(ball.direction.y) > 1)
		// {
		// 	ball.direction.x = ball.direction.x / Math.abs(ball.direction.y);
		// }
		// else
		// {
		// 	if (ball.direction.x > 0)
		// 		ball.direction.x = 1;
		// 	else
		// 		ball.direction.x = -1;
		// }
		ball.position.x = ball_new_x;
		ball.position.y = ball_new_y;
		return ball;
	}

	public calcPaddlePosition(paddle: Paddle): void
	{
		if (paddle.isImmobile)
			return;
		if (paddle.position.y + (paddle.direction * config.paddle.velocity) <= 0)
		{
			paddle.position.y = 0;
		}
		else if ((paddle.position.y + paddle.height + (paddle.direction * config.paddle.velocity)) >= config.game_canvas.height)
		{
			paddle.position.y = config.game_canvas.height - paddle.height;
		}
		else
		{
			paddle.position.y += paddle.direction * config.paddle.velocity;
		}
	}

	public setPaddleDirection(id: number, direction: number): void
	{
		let paddle: Paddle;
		if (id === 1)
		{
			paddle = this.paddle1;
		}
		else
		{
			paddle = this.paddle2;
		}
		paddle.direction = direction;
	}

	public resetGameState() : void 
	{
		this.instance.notScored();
		// this.ball.position.x = config.game_canvas.width / 2;
		// this.ball.position.y = config.game_canvas.height / 2;
		// this.ball.direction = this.calcRandomDirection(this.instance.getRound());

		if (this.isExtended === false)
		{
			this.paddle1.position.y = (config.game_canvas.height - this.paddle1.height) / 2;
			this.paddle2.position.y = (config.game_canvas.height - this.paddle2.height) / 2;
		}

		if (this.isExtended === false)
			return;

		this.roundStart = Date.now();
		this.speedIncCnt = 0;
		// this.fox.hasSizeOf = config.fox.minSize;
		// this.fox.isEnraged = false;
		// this.fox.isEvil = false;
		// this.fox.velocity = config.fox.minVelocity;
		
		// this.ball2.position.x = config.game_canvas.width / 2;
		// this.ball2.position.y = config.game_canvas.height / 2;
		// this.ball2.direction = this.calcRandomDirection(this.instance.getRound());
		
		//make the game faster each round 
		this.ball.velocity -= (this.speedIncCnt * 0.1);
		this.ball2.velocity -= (this.speedIncCnt * 0.1);
		this.ball.velocity = config.ball.velocity + (this.instance.getRound() / 20);
		this.ball2.velocity = config.ball.velocity + (this.instance.getRound() / 20);
		this.fox.velocity = config.fox.minVelocity + (this.instance.getRound() / 20);
	}
}