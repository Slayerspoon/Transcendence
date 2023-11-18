import React, { useRef, useEffect, useState, useContext } from 'react';
import { WebsocketContext } from "../components/Context/WebsocketContexts";

import JoinRandom from '../components/Game/JoinRandom';
import JoinRandomPlus from '../components/Game/JoinRandomPlus';
import ReceivedGameData from '../components/Game/ReceiveGameData';

import musicBavariaSrc from '../../public/assets/Music_Meanwhile_in_Bavaria.mp3';
import musicMushroomKingdomSrc from '../../public/assets/Music_Mushroom_Kingdom.mp3';
import musicNumberOneSrc from '../../public/assets/Music_We_Are_Number_One.mp3';
import musicSpaceDyeVestSrc from '../../public/assets/Music_Space_Dye_Vest.mp3';
import musicStubbSrc from '../../public/assets/Music_Stubb_a_Dubb.mp3';

import videoMcrolldSrc from '../../public/assets/Video_Mcrolld.mp4';
import videoMcrolldReverseSrc from '../../public/assets/Video_Mcrolld_reverse.mp4';

import audioGnomeSrc from '../../public/assets/SoundEffect_Gnome.mp3';
import imageGnomeSrc from '../../public/assets/Image_Gnome.png';

import audioHarkinianOahSrc from '../../public/assets/SoundEffect_Harkinian_Oah.mp3';
import audioHarkinianHitSrc from '../../public/assets/SoundEffect_Harkinian_Hit.mp3';
import videoHarkinianHitSrc from '../../public/assets/Video_Harkinian_Hit.mp4';

import imageFoxBadSrc from '../../public/assets/Image_Fox_bad.png';
import imageFoxGoodSrc from '../../public/assets/Image_Fox_good.png';
import imageFoxEnragedSrc from '../../public/assets/Image_Fox_enraged_ORIGINAL.png';
import audioFoxEnrageSrc from '../../public/assets/SoundEffect_Fox_Enrage.mp3';

import audioFoxMeowSrc from '../../public/assets/SoundEffect_Fox_Meow.mp3';
import audioFoxWoofSrc from '../../public/assets/SoundEffect_Fox_Woof.mp3';
import audioFoxQuackSrc from '../../public/assets/SoundEffect_Fox_Quack.mp3';
import audioFoxChickenSrc from '../../public/assets/SoundEffect_Fox_Chicken.mp3';
import audioFoxGoatSrc from '../../public/assets/SoundEffect_Fox_Goat.mp3';
import audioFoxPigSrc from '../../public/assets/SoundEffect_Fox_Pig.mp3';
import audioFoxTweetSrc from '../../public/assets/SoundEffect_Fox_Tweet.mp3';
import audioFoxAheeSrc from '../../public/assets/SoundEffect_Fox_Ahee.mp3';
import audioFoxChaSrc from '../../public/assets/SoundEffect_Fox_Cha.mp3';
import audioFoxKakaSrc from '../../public/assets/SoundEffect_Fox_Kaka.mp3';
import audioFoxPapaSrc from '../../public/assets/SoundEffect_Fox_Papa.mp3';
import audioFoxYokSrc from '../../public/assets/SoundEffect_Fox_Yok.mp3';

interface Coordinates
{
    x: number;
    y: number;
}

interface Paddle
{
	pos: Coordinates;
	isImmobilized: boolean;
}

interface Ball
{
	pos: Coordinates;
	isUnlocked: boolean;
}

interface Gnome
{
	isUnlocked: boolean;
}

interface Harkinian
{
	pos: Coordinates;
	// isUnlocked: boolean;
}

interface Fox
{
	isUnlocked: boolean;
	// collidedWithPaddle: boolean;
	isEvil: boolean;
	isEnraged: boolean;
	hasSizeOf: number;
	triggeredEnrage: number;
	pos: Coordinates;
	// triggeredEnrage: boolean;
}

interface Triggerables
{
	triggeredGnome: boolean;
	triggeredHarkinian: boolean;
	triggeredPopup: boolean;
}

interface KeyPresses
{
	keyArrowUp: boolean;
	keyArrowDown: boolean;
	keySpace: boolean;
}

const Game: React.FC = () =>
{
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// const canvasWidth: number = 1024; //1200
	// const canvasHeight: number = 576; //720
	const [resizingFactor, setResizingFactor] = useState<number>(1);
  
	var backendWidth: number = 1366;
	var backendHeight: number = 768;
  
	const updateResizingFactor = () => {
	  if (window.innerWidth >= 1366 && window.innerHeight >= 768)
	  {
		  setResizingFactor(window.innerWidth / backendWidth);
	  }
	};
  
	useEffect(() => {
	  window.addEventListener('resize', updateResizingFactor);
  
	  return () => {
		window.removeEventListener('resize', updateResizingFactor);
	  };
	}, []);

	// const [frameRate, setFrameRate] = useState(60);
	// const thenRef = useRef<number | null>(null);
	// const startTimeRef = useRef<number | null>(null);

	// Game modes
			
	var classicMode: boolean = false;
			
			
			
	// Difficulties unlocked

	const [difficultyScore, setDifficultyScore] = useState<number>(0);
	const [difficultyBallAndPaddle, setDifficultyBallAndPaddle] = useState<number>(0);
	const [isUnlockedRandomRGB1, setIsUnlockedRandomRGB1] = useState<boolean>(false);
	const [isUnlockedGnome, setIsUnlockedGnome] = useState<boolean>(false);
	const [isUnlockedHarkinian, setIsUnlockedHarkinian] = useState<boolean>(false);
	const [isUnlockedSubliminal1, setIsUnlockedSubliminal1] = useState<boolean>(false);
	const [isUnlockedRandomRGB2, setIsUnlockedRandomRGB2] = useState<boolean>(false);
	const [isUnlockedSubliminal2, setIsUnlockedSubliminal2] = useState<boolean>(false);
	const [isUnlockedFox, setIsUnlockedFox] = useState<boolean>(false);
	const [isUnlockedSubliminal3, setIsUnlockedSubliminal3] = useState<boolean>(false);
	const [isUnlockedVideo, setIsUnlockedVideo] = useState<boolean>(false);
	const [isUnlockedSecondBall, setIsUnlockedSecondBall] = useState<boolean>(false);
	const [isUnlockedPopups, setIsUnlockedPopups] = useState<boolean>(false);



	// Balls and Fox

	var ballGlobalRadius: number = 15;
	var ballGlobalSpeedDefault: number = 3;
	var ballGlobalSpeedAddedPerma: number = 0;
	var ballGlobalSpeedAddedTemp: number = 0;

	// var ball1X: number = canvasRef.current.width / 2;
	// var ball1Y: number = canvasRef.current.height / 2;
	var ball1DirX: number = 1;
	var ball1DirY: number = 1;
	var ball1SpeedX: number = 1;
	var ball1SpeedY: number = 1;		

	// var ball2X: number = canvasRef.current.width / 2;
	// var ball2Y: number = canvasRef.current.height / 2;
	var ball2DirX: number = 1;
	var ball2DirY: number = 1;
	var ball2SpeedX: number = 1;
	var ball2SpeedY: number = 1;
	
	
	
	// Paddles
	
	var paddleGlobalHeight: number = 100;
	var paddleGlobalWidth: number = 10;
	var paddleGlobalReduction: number = 0;
	var paddleGlobalSpeed: number = 10;
	
	// var paddleP1X: number = (canvasRef.current.width - paddleGlobalWidth * resizingFactor) / 2;
	var paddleP1SpeedMod: number = 0;
	// var paddleP2X: number = (canvasRef.current.height - paddleGlobalWidth * resizingFactor) / 2;
	var paddleP2SpeedMod: number = 0;
	
	var paddleP1IsAttacked: boolean = false;
	var paddleP2IsAttacked: boolean = false;
	
	var keyLeftPressed: boolean = false;
	var keyRightPressed: boolean = false;
	var keyDownPressed: boolean = false;
	var keyAPressed: boolean = false;
	var keyDPressed: boolean = false;
	var keySPressed: boolean = false;
	
	
	
	// Colors
	
	// var colorCodeRGBBackground: string = "000000";
	// var colorCodeRGBScore: string = "FFFFFF";
	// var colorCodeRGBBall1: string = "0095DD";
	// var colorCodeRGBBall2: string = "0095DD";
	// var colorCodeRGBP1: string = "0095DD";
	// var colorCodeRGBP2: string = "0095DD";
	const [colorCodeRGBBackground, setColorCodeRGBBackground] = useState<string>("000000");
	const [colorCodeRGBScore, setColorCodeRGBScore] = useState<string>("FFFFFF");
	const [colorCodeRGBBall1, setColorCodeRGBBall1] = useState<string>("0E4242");
	const [colorCodeRGBBall2, setColorCodeRGBBall2] = useState<string>("0E4242");
	const [colorCodeRGBP1, setColorCodeRGBP1] = useState<string>("0E4242");
	const [colorCodeRGBP2, setColorCodeRGBP2] = useState<string>("0E4242");
	
	
	
	// Gnome
	
	// var gnomeIsActive: boolean = false;
	const [gnomeIsActive, setGnomeIsActive] = useState<boolean>(false);
	// var gnomeStartTime: any = null;
	const [gnomeStartTime, setGnomeStartTime] = useState<any>(null);
	
	
	
	// King Harkinian
	
	// var harkinianIsActive = false;
	const [harkinianIsActive, setHarkinianIsActive] = useState<boolean>(false);
	// var harkinianX = canvasRef.current.width / 2;
	// var harkinianY = canvasRef.current.height / 2;
	var harkinianWidth = 200;
	var harkinianHeight = 150;
	
	
	
	// Fox
	
	// var foxPosX: number = canvasRef.current.width / 2;
	// var foxPosY: number = canvasRef.current.height / 2;
	var foxDirX: number = 1;
	var foxDirY: number = 1;
	var foxSpeedDefault: number = 3;
	var foxSpeed: number = 3;
	var foxIsEvil: boolean = false;
	var foxIsEnraged: boolean = false;
	var foxIsAttacking: boolean = false;
	var foxTimestampLastAppeased: any = null;
	var foxTimeTillEnraged: number = 10000 + Math.random() * 20;
	
	
	
	// Game stats
	
	var Collisions: any = {};
	var ballPaddleBounces: number = 0;
	var scoreP1: number = 0;
	var scoreP2: number = 0;
	var whoLostBall: number = 0;



	// Received game state

	interface GameState
	{
		score1: number;
		score2: number;
		paddle1: Coordinates;
		paddle2: Coordinates;
		ball: Coordinates;
		ball2: Coordinates;
		ball2lock: boolean;
		// gnome: Gnome;
		harkinian: Harkinian;
		fox: Fox;
		collisionFoxPaddle1: boolean;
		collisionFoxPaddle2: boolean;
		triggers: Triggerables;
	}
	
	
	
	// Assets
	
	// Music
	const musicBavaria = useRef<HTMLAudioElement | null>(null);
	const musicMushroomKingdom = useRef<HTMLAudioElement | null>(null);
	const musicNumberOne = useRef<HTMLAudioElement | null>(null);
	const musicSpaceDyeVest = useRef<HTMLAudioElement | null>(null);
	const musicStubb = useRef<HTMLAudioElement | null>(null);
	
	// Video
	const videoMcrolld = useRef<HTMLVideoElement | null>(null);
	const videoMcrolldReverse = useRef<HTMLVideoElement | null>(null);
	// var mcrolldQueued: boolean = true;
	// var mcrolldReverseQueued: boolean = false;
	// var videoToDraw: HTMLVideoElement = videoMcrolld;
	const [mcrolldQueued, setMcrolldQueued] = useState<boolean>(true);
	const [mcrolldReverseQueued, setMcrolldReverseQueued] = useState<boolean>(false);
	const [videoToDraw, setVideoToDraw] = useState<HTMLVideoElement>(videoMcrolld);

	// Gnome
	const imageGnome = useRef<HTMLImageElement>(new Image());
	imageGnome.current.src = imageGnomeSrc;
	imageGnome.current.width = 168;
	imageGnome.current.height = 171;
	const audioGnome = useRef<HTMLAudioElement | null>(null);
	
	// King Harkinian
	const audioHarkinianOah = useRef<HTMLAudioElement | null>(null);
	const audioHarkinianHit = useRef<HTMLAudioElement | null>(null);
	const videoHarkinianHit = useRef<HTMLVideoElement | null>(null);
	
	// Fox
	const imageFoxBad = useRef<HTMLImageElement>(new Image());
	imageFoxBad.current.src = imageFoxBadSrc;
	imageFoxBad.current.width = 50;
	imageFoxBad.current.height = 49;
	const imageFoxGood = useRef<HTMLImageElement>(new Image());
	imageFoxGood.current.src = imageFoxGoodSrc;
	imageFoxGood.current.width = 50;
	imageFoxGood.current.height = 49;
	const imageFoxEnraged = useRef<HTMLImageElement>(new Image());
	imageFoxEnraged.current.src = imageFoxEnragedSrc;
	imageFoxEnraged.current.width = 153;
	imageFoxEnraged.current.height = 149;
	const audioFoxEnrage = useRef<HTMLAudioElement | null>(null);
	// Good sounds
	const audioFoxMeow = useRef<HTMLAudioElement | null>(null);
	const audioFoxWoof = useRef<HTMLAudioElement | null>(null);
	const audioFoxQuack = useRef<HTMLAudioElement | null>(null);
	const audioFoxChicken = useRef<HTMLAudioElement | null>(null);
	const audioFoxGoat = useRef<HTMLAudioElement | null>(null);
	const audioFoxPig = useRef<HTMLAudioElement | null>(null);
	const audioFoxTweet = useRef<HTMLAudioElement | null>(null);
	// Evil sounds
	const audioFoxAhee = useRef<HTMLAudioElement | null>(null);
	const audioFoxCha = useRef<HTMLAudioElement | null>(null);
	const audioFoxKaka = useRef<HTMLAudioElement | null>(null);
	const audioFoxPapa = useRef<HTMLAudioElement | null>(null);
	const audioFoxYok = useRef<HTMLAudioElement | null>(null);
	
	var foxGoodSoundPlaying: HTMLAudioElement = audioFoxMeow;
	var foxEvilSoundPlaying: HTMLAudioElement = audioFoxAhee;

	// var subliminalDepressionIsActive: boolean = false;
	// var subliminalSchizophreniaIsActive: boolean = false;
	// var subliminalHellishIsActive: boolean = false;
	const [subliminalDepressionIsActive, setSubliminalDepressionIsActive] = useState<boolean>(false);
	const [subliminalSchizophreniaIsActive, setSubliminalSchizophreniaIsActive] = useState<boolean>(false);
	const [subliminalHellishIsActive, setSubliminalHellishIsActive] = useState<boolean>(false);

	// var subliminalStartTime: any = null;
	const [subliminalStartTime, setSubliminalStartTime] = useState<any>(null);

	// var subliminalSelectorDepression: number = 0;
	// var subliminalSelectorSchizophrenia: number = 0;
	// var subliminalSelectorHellish: number = 0;
	
	var subliminalMessagesArrayDepression: string[] =
	[
		'Where were you?',
		'You had your chance.',
		'They loved you!',
		'You disappointed them!',
		'Rest will come.',
		'You didn\'t listen...',
		'Suffering...',
		'Endless regret.',
		'The lies...',
		'Stay alone...',
		'You can\'t fix it!',
		'Did you even care?',
		'Why?',
		'How?',
		'When will it end?',
		'Nevermore...',
		'What mattered more?',
		'Was it worth it?',
		'You forgot...',
		'You didn\'t know...',
		'What went wrong?',
		'It hurts so much...',
		'Can\'t believe it...',
		'Nobody.',
		'How long?',
		'What will you do?',
		'What happened?',
		'Shame!',
		'Someone else...',
		'One last time!',
		'Please!',
		'You\'re sorry?',
		'Forever...',
		'So empty...',
		'We were more than friends...',
		'"I do..."',
		'Guilt!',
		'Blame!',
		'Fear!',
		'The memories...',
		'What you had...',
		'What is left?',
		'No more hope.',
		'Weren\'t we happy?',
		'Learn to pretend.',
		'Never be open again.',
		'Failure!',
		'Ignorance!',
		'Reap what you sow...',
		'Love...',
		'Loss...',
		'Darkness surrounding!'
	];
	
	var subliminalMessagesArraySchizophrenia: string[] =
	[
		'Perdition awaits...',
		'It hates us!',
		'We\'ll show them...',
		'They want it!',
		'Who will know?',
		'Why resist?',
		'No way back.',
		'Take it!',
		'Don\'t fight it!',
		'No more help!',
		'Mercy?',
		'Revenge?',
		'Never again!',
		'Make them remember!',
		'Forsake forgiveness!',
		'It will be fun!',
		'They float!',
		'They never understood!',
		'Sick of this!',
		'Who are you?',
		'Do you remember?',
		'It was a mistake!',
		'No right or wrong!',
		'Set us free!',
		'Alive?',
		'You are the dark.',
		'You are the light.',
		'We want to help!',
		'How does it feel?',
		'Let\'s make a deal.',
		'A price for you alone.',
		'The sleep...',
		'Will we survive?',
		'Must feed...',
		'The hunger...',
		'Ignore love and peace!',
		'It still moves.',
		'Come closer.',
		'They dream now.',
		'Inside?',
		'They know!',
		'Flip today!',
		'Mother?',
		'Won\'t be here tomorrow...',
		'Do you know the way?',
		'Eat it!',
		'Nobody knows!',
		'What have you done?',
		'Liar!',
		'From the soil...',
		'They cry out!',
		'Close their eyes.',
		'No one said it\'s fair.',
		'Free!',
		'Reality?',
		'Euphoria...',
		'Take control!',
		'Let it go!'
	];
	
	var subliminalMessagesArrayHellish: string[] =
	[
		'It burns!',
		'Walk into the fire!',
		'Embrace the madness!',
		'Dance with us!',
		'Come and play!',
		'We will live forever!',
		'Feast!',
		'Let loose!',
		'Damnation!',
		'Watch them cry!',
		'Just one bite!',
		'Trust us!',
		'Join us!',
		'Don\'t look back!',
		'Spinning duck!',
		'Faster!',
		'Harder!',
		'Keep going!',
		'HAHAHA!',
		'Scream your lungs out!',
		'Laugh louder!',
		'Don\'t do it!',
		'Please stop!',
		'No!',
		'Yes!',
		'Let\'s have a party!',
		'The goblin child!',
		'Destroy!',
		'Help!',
		'I\'ll gladly take your soul!',
		'Sober up quick!',
		'No one cares!',
		'It shines!',
		'Marvelous!',
		'The number!',
		'Sausage!',
		'Smile!',
		'Round and round it goes!',
		'Whee!',
		'Egg!'
	];

	const [subliminalSelectorDepression, setSubliminalSelectorDepression] = useState<number>(Math.floor(Math.random() * 100) % (subliminalMessagesArrayDepression.length));
	const [subliminalSelectorSchizophrenia, setSubliminalSelectorSchizophrenia] = useState<number>(Math.floor(Math.random() * 100) % (subliminalMessagesArraySchizophrenia.length));
	const [subliminalSelectorHellish, setSubliminalSelectorHellish] = useState<number>(Math.floor(Math.random() * 100) % (subliminalMessagesArrayHellish.length));
	
	// Set the multimedia sources when the component has rendered
	useEffect(() =>
	{
		if (audioGnome.current)
		{
			audioGnome.current.src = audioGnomeSrc;
		}
		if (audioHarkinianHit.current)
		{
			audioHarkinianHit.current.src = audioHarkinianHitSrc;
		}
		if (audioHarkinianOah.current)
		{
			audioHarkinianOah.current.src = audioHarkinianOahSrc;
		}
		if (audioFoxMeow.current)
		{
			audioFoxMeow.current.src = audioFoxMeowSrc;
			foxGoodSoundPlaying = audioFoxMeow.current;
		}
		if (audioFoxWoof.current)
		{
			audioFoxWoof.current.src = audioFoxWoofSrc;
		}
		if (audioFoxQuack.current)
		{
			audioFoxQuack.current.src = audioFoxQuackSrc;
		}
		if (audioFoxChicken.current)
		{
			audioFoxChicken.current.src = audioFoxChickenSrc;
		}
		if (audioFoxGoat.current)
		{
			audioFoxGoat.current.src = audioFoxGoatSrc;
		}
		if (audioFoxPig.current)
		{
			audioFoxPig.current.src = audioFoxPigSrc;
		}
		if (audioFoxTweet.current)
		{
			audioFoxTweet.current.src = audioFoxTweetSrc;
		}
		if (audioFoxAhee.current)
		{
			audioFoxAhee.current.src = audioFoxAheeSrc;
			foxEvilSoundPlaying = audioFoxAhee.current;
		}
		if (audioFoxCha.current)
		{
			audioFoxCha.current.src = audioFoxChaSrc;
		}
		if (audioFoxKaka.current)
		{
			audioFoxKaka.current.src = audioFoxKakaSrc;
		}
		if (audioFoxPapa.current)
		{
			audioFoxPapa.current.src = audioFoxPapaSrc;
		}
		if (audioFoxYok.current)
		{
			audioFoxYok.current.src = audioFoxYokSrc;
		}
		if (audioFoxEnrage.current)
		{
			audioFoxEnrage.current.src = audioFoxEnrageSrc;
		}
		if (videoHarkinianHit.current)
		{
			videoHarkinianHit.current.src = videoHarkinianHitSrc;
		}
		if (musicBavaria.current)
		{
			musicBavaria.current.src = musicBavariaSrc;
		}
		if (musicMushroomKingdom.current)
		{
			musicMushroomKingdom.current.src = musicMushroomKingdomSrc;
		}
		if (musicNumberOne.current)
		{
			musicNumberOne.current.src = musicNumberOneSrc;
		}
		if (musicSpaceDyeVest.current)
		{
			musicSpaceDyeVest.current.src = musicSpaceDyeVestSrc;
		}
		if (musicStubb.current)
		{
			musicStubb.current.src = musicStubbSrc;
		}
		if (videoMcrolld.current)
		{
			  videoMcrolld.current.src = videoMcrolldSrc;
		}
		if (videoMcrolldReverse.current)
		{
			  videoMcrolldReverse.current.src = videoMcrolldReverseSrc;
		}
	}, []);

	function randomizeColors(): void
	{
		//if (difficultyScore >= 20)
		//{
			setColorCodeRGBBackground(Math.floor(Math.random()*Math.random()*16777215/2).toString(16));
		//}
		setColorCodeRGBScore(Math.floor(Math.random()*16777215/2 + 16777215/2).toString(16));
		setColorCodeRGBBall1(Math.floor(Math.random()*16777215/2 + 16777215/2).toString(16));
		setColorCodeRGBBall2(Math.floor(Math.random()*16777215/2 + 16777215/2).toString(16));
		setColorCodeRGBP1(Math.floor(Math.random()*16777215/2 + 16777215/2).toString(16));
		setColorCodeRGBP2(Math.floor(Math.random()*16777215/2 + 16777215/2).toString(16));
	}
	
	function drawBackground(ctx: CanvasRenderingContext2D): void
	{
		ctx.beginPath();
		ctx.rect(0, 0, canvasRef.current.width, canvasRef.current.height);
		ctx.fillStyle = "#" + colorCodeRGBBackground;
		ctx.fill();
		ctx.closePath();
	}
	
	function drawBalls(ctx: CanvasRenderingContext2D, ball1x: number, ball1y: number, ball2unlocked: boolean, ball2x: number, ball2y: number): void
	{
		// if (lastGameState.triggerables.triggeredGnome === false)
		// {
			ctx.beginPath();
			ctx.arc(ball1x * resizingFactor, ball1y * resizingFactor, ballGlobalRadius * resizingFactor, 0, Math.PI * 2);
			ctx.fillStyle = "#" + colorCodeRGBBall1;
			ctx.fill();
			ctx.closePath();
			
			if (ball2unlocked === true)
			{
				ctx.beginPath();
				ctx.arc(ball2x * resizingFactor, ball2y * resizingFactor, ballGlobalRadius * resizingFactor, 0, Math.PI * 2);
				ctx.fillStyle = "#" + colorCodeRGBBall2;
				ctx.fill();
				ctx.closePath();
			}
		// }
	}
	
	function drawPaddles(ctx: CanvasRenderingContext2D, paddle1x: number, paddle1y: number, paddle2x: number, paddle2y: number): void
	{
		ctx.beginPath();
		ctx.rect(paddle1x * resizingFactor, paddle1y * resizingFactor, (paddleGlobalWidth - paddleGlobalReduction) * resizingFactor, paddleGlobalHeight * resizingFactor);
		ctx.fillStyle = "#" + colorCodeRGBP1;
		ctx.fill();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.rect(paddle2x * resizingFactor, paddle2y * resizingFactor, (paddleGlobalWidth - paddleGlobalReduction) * resizingFactor, paddleGlobalHeight * resizingFactor);
		ctx.fillStyle = "#" + colorCodeRGBP2;
		ctx.fill();
		ctx.closePath();
	}
	
	function drawScore(ctx: CanvasRenderingContext2D, score1: number, score2: number): void
	{
		ctx.font = "20px Sherwood";
		ctx.fillStyle = "#" + colorCodeRGBScore;
		ctx.textAlign = 'center'; // Horizontal centering
		ctx.fillText(`Score P1: ${score1}`, 50 * resizingFactor, 20 * resizingFactor);
		ctx.fillText(`Score P2: ${score2}`, canvasRef.current.width - 100 * resizingFactor, 20 * resizingFactor);
	}
	
	function drawGnome(ctx: CanvasRenderingContext2D, score1: number, score2: number, triggered: boolean, ball1X: number, ball1Y: number, ball2X: number, ball2Y: number, foxX: number, foxY: number, timestamp: number): void
	{
		if (score1 + score2 >= 5)
		{
			if (gnomeIsActive === false)
			{
				if (triggered === true) // (Math.floor(Math.random()*1000) === 666)
				{
					setGnomeStartTime(timestamp);
					setGnomeIsActive(true);
					audioGnome.current.play();
					// gnome_swap();
				}
			}
			else if (timestamp - gnomeStartTime <= 200)
			{
				ctx.drawImage(imageGnome.current, (ball1X - 80) * resizingFactor, (ball1Y - 90) * resizingFactor);
				if (score1 + score2 >= 40)
				{
					ctx.drawImage(imageGnome.current, (ball2X - 80) * resizingFactor, (ball2Y - 90) * resizingFactor);
				}
				if (score1 + score2 >= 30)
				{
					ctx.drawImage(imageGnome.current, (foxX - 80) * resizingFactor, (foxY - 90) * resizingFactor);
				}
			}
			else
			{
				setGnomeIsActive(false);
			}
		}
	}
	
	function drawHarkinian(ctx: CanvasRenderingContext2D, score1: number, score2: number, triggered: boolean, posX: number, posY: number): void
	{
		if (score1 + score2 >= 15)
		{
			if (harkinianIsActive === false)
			{
				if (triggered === true) //(Math.floor(Math.random()*1000) === 666)
				{
					setHarkinianIsActive(true);
					videoHarkinianHit.current.play();
					audioHarkinianOah.current.play();
					audioHarkinianHit.current.play();
					//harkinian_hit(Math.floor(Math.random() * 100));
				}
			}
			else if (videoHarkinianHit.current.paused === false)
			{
				ctx.drawImage(videoHarkinianHit.current, (posX - (harkinianWidth / 2)) * resizingFactor, (posY - (harkinianHeight / 2)) * resizingFactor, harkinianWidth * resizingFactor, harkinianHeight * resizingFactor);
			}
			else
			{
				setHarkinianIsActive(false);
			}
		}
	}
	
	function drawFox(ctx: CanvasRenderingContext2D, score1: number, score2: number, foxUnlocked: boolean, foxEvil: boolean, foxEnraged: boolean, triggeredEnrage: number, collisionFoxPaddle1: boolean, collisionFoxPaddle2: boolean, foxPosX: number, foxPosY: number): void
	{
		if (foxUnlocked === true)
		{
			if (foxEnraged === true)
			{
				ctx.drawImage(imageFoxEnraged.current, foxPosX * resizingFactor, foxPosY * resizingFactor);
			}
			else if (foxEvil === true)
			{
				ctx.drawImage(imageFoxBad.current, foxPosX * resizingFactor, foxPosY * resizingFactor);
			}
			else
			{
				ctx.drawImage(imageFoxGood.current, foxPosX * resizingFactor, foxPosY * resizingFactor);
			}

			if (triggeredEnrage > 0 && (audioFoxEnrage.current.paused || audioFoxEnrage.current.ended))
			{
				audioFoxEnrage.current.play();
			}
			if (collisionFoxPaddle1 === true || collisionFoxPaddle2 === true)
			{
				if (foxEvil === true && foxSoundsEvilNotPlaying() === true)
				{
					fox_sounds_evil();
				}
				if (foxEvil === false && foxSoundsGoodNotPlaying() === true)
				{
					fox_sounds_good();
				}
			}
		}
	}
	
	// function collisionCheck_ballPaddle(ballFutureX: number, ballFutureY: number): number
	// {
	// 	let collision: number = 0;
		
	// 	// Paddle 1
	// 	if (ballFutureY >= canvasHeight - ballGlobalRadius)
	// 	{
	// 		if (ballFutureX + ballGlobalRadius / 2 >= paddleP1X &&
	// 			ballFutureX - ballGlobalRadius / 2 <= paddleP1X + paddleGlobalWidth - paddleGlobalReduction)
	// 		{
	// 			collision = 1;
	// 		}
	// 	}
	// 	// Paddle 2
	// 	else if (ballFutureY <= 0 + ballGlobalRadius)
	// 	{
	// 		if (ballFutureX + ballGlobalRadius / 2 >= paddleP2X &&
	// 			ballFutureX - ballGlobalRadius / 2 <= paddleP2X + paddleGlobalWidth - paddleGlobalReduction)
	// 		{
	// 			collision = 2;
	// 		}
	// 	}
	// 	return collision;
	// }
	
	function collisionCheck_ballWall(ballReceivedY: number): boolean
	{
		let collision: boolean = false;
		
		if (ballReceivedY <= 3 ||
			ballReceivedY >= canvasRef.current.height - 3)
		{
			collision = true;
		}
		return collision;
	}
	
	// function collisionCheck_lostBall(ballFutureX: number, ballFutureY: number): number
	// {
	// 	let whoLostBall: number = 0;
		
	// 	if (ballFutureY <= 0 + ballGlobalRadius)
	// 	{
	// 		whoLostBall = 2;
	// 	}
	// 	else if (ballFutureY >= canvasHeight - ballGlobalRadius)
	// 	{
	// 		whoLostBall = 1;
	// 	}
	// 	return whoLostBall;
	// }
	
	// function collisionCheck_foxBall(ballX: number, ballY: number, foxWidth: number, foxHeight: number): string
	// {
	// 	let collision = "";
		
	// 	// Check "up" (with 3 pixels error margin)
	// 	if (ballX >= foxPosX && ballX <= foxPosX + foxWidth &&
	// 		ballY >= foxPosY - 3 && ballY <= foxPosY + 10)
	// 		//ballY >= foxPosY - 3 && ballY <= foxPosY + 3)
	// 	{
	// 		collision = "up";
	// 	}
	// 	// Check "down" (with 3 pixels error margin)
	// 	else if (ballX >= foxPosX && ballX <= foxPosX + foxWidth &&
	// 			 ballY >= foxPosY + foxHeight - 10 && ballY <= foxPosY + foxHeight + 3)
	// 			 //ballY >= foxPosY + imageFoxBad.height - 3 && ballY <= foxPosY + imageFoxBad.height + 3)
	// 	{
	// 		collision = "down";
	// 	}
	// 	// Check "left" (with 3 pixels error margin)
	// 	else if (ballY >= foxPosY && ballY <= foxPosY + foxHeight &&
	// 			 ballX >= foxPosX - 3 && ballX <= foxPosX + 10)
	// 			 //ballX >= foxPosX - 3 && ballX <= foxPosX + 3)
	// 	{
	// 		collision = "left";
	// 	}
	// 	// Check "right" (with 3 pixels error margin)
	// 	else if (ballY >= foxPosY && ballY <= foxPosY + foxHeight &&
	// 			 ballX >= foxPosX + foxWidth - 10 && ballX <= foxPosX + foxWidth + 3)
	// 			 //ballX >= foxPosX + imageFoxBad.width - 3 && ballX <= foxPosX + imageFoxBad.width + 3)
	// 	{
	// 		collision = "right";
	// 	}
	// 	return collision;
	// }
	
	// function collisionCheck_foxPaddle(paddleX: number, paddleY: number, foxWidth: number, foxHeight: number): boolean
	// {
	// 	let collision = false;
		
	// 	if (paddleY === 0)
	// 	{
	// 		if (foxPosX + foxWidth >= paddleX && foxPosX <= paddleX + paddleGlobalWidth - paddleGlobalReduction &&
	// 			foxPosY <= paddleY + paddleGlobalHeight)
	// 		{
	// 			collision = true;
	// 		}
	// 	}
	// 	else
	// 	{
	// 		if (foxPosX + foxWidth >= paddleX && foxPosX <= paddleX + paddleGlobalWidth - paddleGlobalReduction &&
	// 			foxPosY + foxHeight >= paddleY)
	// 		{
	// 			collision = true;
	// 		}
	// 	}
	// 	return collision;
	// }
	
	// // With position correction
	// function collisionCheck_foxWall(foxWidth: number, foxHeight: number): string
	// {
	// 	let collision = "";
		
	// 	if (foxPosX + (foxSpeed * foxDirX) <= 0)
	// 	{
	// 		collision = "left";
	// 		foxPosX = 1;
	// 	}
	// 	else if (foxPosX + foxWidth + (foxSpeed * foxDirX) >= canvasWidth)
	// 	{
	// 		collision = "right";
	// 		foxPosX = canvasWidth - foxWidth - 1;
	// 	}
	// 	else if (foxPosY + (foxSpeed * foxDirY) <= 0)
	// 	{
	// 		collision = "up";
	// 		foxPosY = 1;
	// 	}
	// 	else if (foxPosY + foxHeight + (foxSpeed * foxDirY) >= canvasHeight)
	// 	{
	// 		collision = "down";
	// 		foxPosY = canvasHeight - foxHeight - 1;
	// 	}
	// 	return collision;
	// }
	
	// function collisionCheck(): void
	// {
	// 	// Collisions.collision_ball1_paddle1 = 0;
	// 	// Collisions.collision_ball1_paddle2 = 0;
	// 	Collisions.collision_ball1_wall = false;
	// 	// Collisions.ball1_loser = 0;
	// 	// Collisions.collision_ball2_paddle1 = 0;
	// 	// Collisions.collision_ball2_paddle2 = 0;
	// 	Collisions.collision_ball2_wall = false;
	// 	// Collisions.ball2_loser = 0;
		
	// 	// Collisions.fox_ball1 = "";
	// 	// Collisions.fox_ball2 = "";
	// 	// Collisions.fox_paddle1 = false;
	// 	// Collisions.fox_paddle2 = false;
	// 	// Collisions.fox_wall = "";
	
	// 	// Collisions.collision_ball1_paddle1 = collisionCheck_ballPaddle(ball1X + (ball1SpeedX * ball1DirX), ball1Y + (ball1SpeedY * ball1DirY));
	// 	// Collisions.collision_ball1_paddle2 = collisionCheck_ballPaddle(ball1X + (ball1SpeedX * ball1DirX), ball1Y + (ball1SpeedY * ball1DirY));
	// 	Collisions.collision_ball1_wall = collisionCheck_ballWall(lastGameState.ball.y);
	// 	// Collisions.ball1_loser = 0;
	// 	// if (Collisions.collision_ball1_paddle1 === 0 && Collisions.collision_ball1_paddle2 === 0)
	// 	// {
	// 	// 	Collisions.ball1_loser = collisionCheck_lostBall(ball1X + (ball1SpeedX * ball1DirX), ball1Y + (ball1SpeedY * ball1DirY));
	// 	// }
		
	// 	if (isUnlockedSecondBall)
	// 	{
	// 		// Collisions.collision_ball2_paddle1 = collisionCheck_ballPaddle(ball2X + (ball2SpeedX * ball2DirX), ball2Y + (ball2SpeedY * ball2DirY));
	// 		// Collisions.collision_ball2_paddle2 = collisionCheck_ballPaddle(ball2X + (ball2SpeedX * ball2DirX), ball2Y + (ball2SpeedY * ball2DirY));
	// 		Collisions.collision_ball2_wall = collisionCheck_ballWall(lastGameState.ball2.y);
	// 		// Collisions.ball2_loser = 0;
	// 		// if (Collisions.collision_ball2_paddle1 === 0 || Collisions.collision_ball2_paddle2 === 0)
	// 		// {
	// 		// 	Collisions.ball2_loser = collisionCheck_lostBall(ball2X + (ball2SpeedX * ball2DirX), ball2Y + (ball2SpeedY * ball2DirY));
	// 		// }
	// 	}
		
	// 	// if (isUnlockedFox)
	// 	// {
	// 	// 	if (foxIsEnraged)
	// 	// 	{
	// 	// 		var foxWidth = 153;
	// 	// 		var foxHeight = 149;
	// 	// 	}
	// 	// 	else
	// 	// 	{
	// 	// 		var foxWidth = 50;
	// 	// 		var foxHeight = 49;
	// 	// 	}
			
	// 	// 	Collisions.fox_ball1 = collisionCheck_foxBall(ball1X, ball1Y, foxWidth, foxHeight);
	// 	// 	Collisions.fox_ball2 = collisionCheck_foxBall(ball2X, ball2Y, foxWidth, foxHeight);
	// 	// 	Collisions.fox_paddle1 = collisionCheck_foxPaddle(paddleP1X, canvasHeight - paddleGlobalHeight, foxWidth, foxHeight);
	// 	// 	Collisions.fox_paddle2 = collisionCheck_foxPaddle(paddleP2X, 0, foxWidth, foxHeight);
	// 	// 	Collisions.fox_wall = collisionCheck_foxWall(foxWidth, foxHeight);
	// 	// }
	// }
	
	// function moveBalls(): void
	// {
	// 	// Move Ball 1
	// 	if (isUnlockedFox && foxIsEnraged)
	// 	{
	// 		if (Collisions.fox_ball1 === "up")
	// 		{
	// 			if (ball1DirY === 1)
	// 			{
	// 				ball1DirY = -ball1DirY;
	// 			}
	// 		}
	// 		else if (Collisions.fox_ball1 === "down")
	// 		{
	// 			if (ball1DirY === -1)
	// 			{
	// 				ball1DirY = -ball1DirY;
	// 			}
	// 		}
	// 		else if (Collisions.fox_ball1 === "left")
	// 		{
	// 			if (ball1DirX === 1)
	// 			{
	// 				ball1DirX = -ball1DirX;
	// 			}
	// 		}
	// 		else if (Collisions.fox_ball1 === "right")
	// 		{
	// 			if (ball1DirX === -1)
	// 			{
	// 				ball1DirX = -ball1DirX;
	// 			}
	// 		}
	// 	}
		
	// 	if (Collisions.collision_ball1_paddle1 != 0 || Collisions.collision_ball1_paddle2 != 0)
	// 	{
	// 		ball1DirY = -ball1DirY;
	// 		ball1Y = ball1Y + (ball1SpeedY * ball1DirY);
	// 	}
	// 	else if (Collisions.collision_ball1_wall === true)
	// 	{
	// 		ball1DirX = -ball1DirX;
	// 		ball1X = ball1X + (ball1SpeedX * ball1DirX);
	// 	}
	// 	else if (Collisions.ball1_loser != 0)
	// 	{
	// 		ball1X = canvasWidth / 2;
	// 		ball1Y = canvasHeight / 2;
	// 	}
	// 	else
	// 	{
	// 		ball1X = ball1X + (ball1SpeedX * ball1DirX);
	// 		ball1Y = ball1Y + (ball1SpeedY * ball1DirY);
	// 	}
		
	// 	// Move Ball 2
	// 	if (isUnlockedSecondBall)
	// 	{
	// 		if (isUnlockedFox && foxIsEnraged)
	// 		{
	// 			if (Collisions.fox_ball2 === "up")
	// 			{
	// 				if (ball2DirY === 1)
	// 				{
	// 					ball2DirY = -ball2DirY;
	// 				}
	// 			}
	// 			else if (Collisions.fox_ball2 === "down")
	// 			{
	// 				if (ball2DirY === -1)
	// 				{
	// 					ball2DirY = -ball2DirY;
	// 				}
	// 			}
	// 			else if (Collisions.fox_ball2 === "left")
	// 			{
	// 				if (ball2DirX === 1)
	// 				{
	// 					ball2DirX = -ball2DirX;
	// 				}
	// 			}
	// 			else if (Collisions.fox_ball2 === "right")
	// 			{
	// 				if (ball2DirX === -1)
	// 				{
	// 					ball2DirX = -ball2DirX;
	// 				}
	// 			}
	// 		}
			
	// 		if (Collisions.collision_ball2_paddle1 != 0 || Collisions.collision_ball2_paddle2 != 0)
	// 		{
	// 			ball2DirY = -ball2DirY;
	// 			ball2Y = ball2Y + (ball2SpeedY * ball2DirY);
	// 		}
	// 		else if (Collisions.collision_ball2_wall === true)
	// 		{
	// 			ball2DirX = -ball2DirX;
	// 			ball2X = ball2X + (ball2SpeedX * ball2DirX);
	// 		}
	// 		else if (Collisions.ball2_loser != 0)
	// 		{
	// 			ball2X = canvasWidth / 2;
	// 			ball2Y = canvasHeight / 2;
	// 		}
	// 		else
	// 		{
	// 			ball2X = ball2X + (ball2SpeedX * ball2DirX);
	// 			ball2Y = ball2Y + (ball2SpeedY * ball2DirY);
	// 		}
	// 	}
	// }
	
	// function moveFox(timestamp: number): void
	// {
	// 	if (isUnlockedFox)
	// 	{
	// 		if (foxIsAttacking)
	// 		{
	// 			if (Math.floor(Math.random() * 100) === 42)
	// 			{
	// 				foxTimestampLastAppeased = timestamp;
	// 				foxTimeTillEnraged = 10000 + Math.random() * 20;
	// 				foxIsAttacking = false;
	// 				foxIsEnraged = false;
	// 				foxIsEvil = false;
	// 				foxSpeed = foxSpeedDefault + ballGlobalSpeedAddedPerma;
	// 			}
	// 		}
	// 		else if (foxIsEnraged)
	// 		{
	// 			if (Math.floor(Math.random() * 100) === 42)
	// 			{
	// 				foxDirX = -foxDirX;
	// 			}
	// 			if (Math.floor(Math.random() * 100) === 42)
	// 			{
	// 				foxDirY = -foxDirY;
	// 			}
	// 			foxPosX = foxPosX + (foxSpeed * foxDirX);
	// 			foxPosY = foxPosY + (foxSpeed * foxDirY);
	// 			if (Collisions.fox_paddle1 === true || Collisions.fox_paddle2 === true)
	// 			{
	// 				foxIsAttacking = true;
	// 				foxSpeed = 0;
	// 				fox_sounds_evil();
	// 			}
	// 		}
	// 		else if (foxIsEvil)
	// 		{
	// 			foxPosX = foxPosX + (foxSpeed * foxDirX);
	// 			foxPosY = foxPosY + (foxSpeed * foxDirY);
	// 			if (Collisions.fox_paddle1 === true || Collisions.fox_paddle2 === true)
	// 			{
	// 				foxIsAttacking = true;
	// 				foxSpeed = 0;
	// 				fox_sounds_evil();
	// 			}
	// 			if (foxIsAttacking === false && Math.floor(Math.random() * 1000) % 100 === 0)
	// 			{
	// 				foxIsEvil = false;
	// 			}
	// 			if (foxIsAttacking === false && timestamp - foxTimestampLastAppeased >= foxTimeTillEnraged)
	// 			{
	// 				audioFoxEnrage.current.play();
	// 				foxIsEnraged = true;
	// 				foxIsEvil = true;
	// 				foxSpeed = 15;
	// 			}
	// 		}
	// 		else
	// 		{
	// 			foxPosX = foxPosX + (foxSpeed * foxDirX);
	// 			foxPosY = foxPosY + (foxSpeed * foxDirY);
	// 			if (Collisions.fox_paddle1 === true)
	// 			{
	// 				foxDirY = -1;
	// 				foxTimestampLastAppeased = timestamp;
	// 				foxTimeTillEnraged = 10000 + Math.random() * 20;
	// 				fox_sounds_good();
	// 			}
	// 			else if (Collisions.fox_paddle2 === true)
	// 			{
	// 				foxDirY = 1;
	// 				foxTimestampLastAppeased = timestamp;
	// 				foxTimeTillEnraged = 10000 + Math.random() * 20;
	// 				fox_sounds_good();
	// 			}
	// 			if (Math.floor(Math.random() * 1000) % 100 === 0)
	// 			{
	// 				foxIsEvil = true;
	// 			}
	// 			if (foxIsAttacking === false && timestamp - foxTimestampLastAppeased >= foxTimeTillEnraged)
	// 			{
	// 				audioFoxEnrage.current.play();
	// 				foxIsEnraged = true;
	// 				foxIsEvil = true;
	// 				foxSpeed = 15;
	// 			}
	// 		}
			
	// 		if (Collisions.fox_wall === "up")
	// 		{
	// 			foxPosY++;
	// 			foxDirY = -foxDirY;
	// 		}
	// 		else if (Collisions.fox_wall === "down")
	// 		{
	// 			foxPosY--;
	// 			foxDirY = -foxDirY;
	// 		}
	// 		else if (Collisions.fox_wall === "left")
	// 		{
	// 			foxPosX++;;
	// 			foxDirX = -foxDirX;
	// 		}
	// 		else if (Collisions.fox_wall === "right")
	// 		{
	// 			foxPosX--;
	// 			foxDirX = -foxDirX;
	// 		}
	// 	}
	// 	else
	// 	{
	// 		foxTimestampLastAppeased = timestamp;
	// 	}
	// }

	function foxSoundsGoodNotPlaying(): boolean
	{
		let countNotPlaying: number = 0;

		if (audioFoxChicken.current.paused === true || audioFoxChicken.current.ended === true)
			countNotPlaying++;
		if (audioFoxGoat.current.paused === true || audioFoxGoat.current.ended === true)
			countNotPlaying++;
		if (audioFoxMeow.current.paused === true || audioFoxMeow.current.ended === true)
			countNotPlaying++;
		if (audioFoxPig.current.paused === true || audioFoxPig.current.ended === true)
			countNotPlaying++;
		if (audioFoxQuack.current.paused === true || audioFoxQuack.current.ended === true)
			countNotPlaying++;
		if (audioFoxTweet.current.paused === true || audioFoxTweet.current.ended === true)
			countNotPlaying++;
		if (audioFoxWoof.current.paused === true || audioFoxWoof.current.ended === true)
			countNotPlaying++;

		if (countNotPlaying == 7)
			return true;
		else
			return false;
	}

	function foxSoundsEvilNotPlaying(): boolean
	{
		let countNotPlaying: number = 0;

		if (audioFoxAhee.current.paused === true || audioFoxAhee.current.ended === true)
			countNotPlaying++;
		if (audioFoxCha.current.paused === true || audioFoxCha.current.ended === true)
			countNotPlaying++;
		if (audioFoxKaka.current.paused === true || audioFoxKaka.current.ended === true)
			countNotPlaying++;
		if (audioFoxPapa.current.paused === true || audioFoxPapa.current.ended === true)
			countNotPlaying++;
		if (audioFoxYok.current.paused === true || audioFoxYok.current.ended === true)
			countNotPlaying++;

		if (countNotPlaying == 5)
			return true;
		else
			return false;
	}
	
	function fox_sounds_good(): void
	{
		let selector: number = Math.floor(Math.random() * 100) % 7;
		
		if (selector === 0)
		{
			audioFoxChicken.current.play();
			foxGoodSoundPlaying = audioFoxChicken.current;
		}
		else if (selector === 1)
		{
			audioFoxGoat.current.play();
			foxGoodSoundPlaying = audioFoxGoat.current;
		}
		else if (selector === 2)
		{
			audioFoxMeow.current.play();
			foxGoodSoundPlaying = audioFoxMeow.current;
		}
		else if (selector === 3)
		{
			audioFoxPig.current.play();
			foxGoodSoundPlaying = audioFoxPig.current;
		}
		else if (selector === 4)
		{
			audioFoxQuack.current.play();
			foxGoodSoundPlaying = audioFoxQuack.current;
		}
		else if (selector === 5)
		{
			audioFoxTweet.current.play();
			foxGoodSoundPlaying = audioFoxTweet.current;
		}
		else if (selector === 6)
		{
			audioFoxWoof.current.play();
			foxGoodSoundPlaying = audioFoxWoof.current;
		}
	}
	
	function fox_sounds_evil(): void
	{
		let selector: number = Math.floor(Math.random() * 100) % 5;
		
		if (selector === 0)
		{
			audioFoxAhee.current.play();
			foxEvilSoundPlaying = audioFoxAhee.current;
		}
		else if (selector === 1)
		{
			audioFoxCha.current.play();
			foxEvilSoundPlaying = audioFoxCha.current;
		}
		else if (selector === 2)
		{
			audioFoxKaka.current.play();
			foxEvilSoundPlaying = audioFoxKaka.current;
		}
		else if (selector === 3)
		{
			audioFoxPapa.current.play();
			foxEvilSoundPlaying = audioFoxPapa.current;
		}
		else if (selector === 4)
		{
			audioFoxYok.current.play();
			foxEvilSoundPlaying = audioFoxYok.current;
		}
	}

	// function foxSounds(): void
	// {
	// 	if (lastGameState.fox.triggeredEnrage === true && (audioFoxEnrage.current.paused() || audioFoxEnrage.current.ended()))
	// 	{
	// 		audioFoxEnrage.current.play();
	// 	}
	// 	if (lastGameState.fox.collidedWithPaddle === true)
	// 	{
	// 		if (lastGameState.fox.isEvil === true && (foxEvilSoundPlaying.paused || foxEvilSoundPlaying.ended))
	// 		{
	// 			fox_sounds_evil();
	// 		}
	// 		else if (foxGoodSoundPlaying.paused || foxGoodSoundPlaying.ended)
	// 		{
	// 			fox_sounds_good();
	// 		}
	// 	}
	// }
	
	// function movePaddles(): void
	// {
	// 	// if (isUnlockedFox)
	// 	// {
	// 	// 	if (foxIsEvil)
	// 	// 	{
	// 	// 		if (Collisions.fox_paddle1 === true)
	// 	// 		{
	// 	// 			paddleP1IsAttacked = true;
	// 	// 			paddleP2IsAttacked = false;
	// 	// 		}
	// 	// 		else if (Collisions.fox_paddle2 === true)
	// 	// 		{
	// 	// 			paddleP2IsAttacked = true;
	// 	// 			paddleP1IsAttacked = false;
	// 	// 		}
	// 	// 		else
	// 	// 		{
	// 	// 			paddleP1IsAttacked = false;
	// 	// 			paddleP2IsAttacked = false;
	// 	// 		}
	// 	// 	}
	// 	// }
		
	// 	if (paddleP1IsAttacked === false)
	// 	{
	// 		if (keyDownPressed)
	// 		{
	// 			paddleP1SpeedMod = 10;
	// 		}
	// 		else
	// 		{
	// 			paddleP1SpeedMod = 0;
	// 		}
			
	// 		if (keyRightPressed)
	// 		{
	// 			paddleP1X = Math.min(paddleP1X + paddleGlobalSpeed + paddleP1SpeedMod, canvasWidth - (paddleGlobalWidth - paddleGlobalReduction));
	// 		}
	// 		else if (keyLeftPressed)
	// 		{
	// 			paddleP1X = Math.max(paddleP1X - paddleGlobalSpeed - paddleP1SpeedMod, 0);
	// 		}
	// 	}
		
	// 	if (paddleP2IsAttacked === false)
	// 	{
	// 		if (keySPressed)
	// 		{
	// 			paddleP2SpeedMod = 10;
	// 		}
	// 		else
	// 		{
	// 			paddleP2SpeedMod = 0;
	// 		}
		
	// 		if (keyDPressed)
	// 		{
	// 			paddleP2X = Math.min(paddleP2X + paddleGlobalSpeed + paddleP2SpeedMod, canvasWidth - (paddleGlobalWidth - paddleGlobalReduction));
	// 		}
	// 		else if (keyAPressed)
	// 		{
	// 			paddleP2X = Math.max(paddleP2X - paddleGlobalSpeed - paddleP2SpeedMod, 0);
	// 		}
	// 	}
	// }

	function control_RGB(): void
	{
		// Randomize colors on ball bounce
		// if (isUnlockedRandomRGB1)
		// {
		// 	if (Collisions.collision_ball1_paddle1 != 0 ||
		// 		Collisions.collision_ball1_paddle2 != 0 ||
		// 		Collisions.collision_ball2_paddle1 != 0 ||
		// 		Collisions.collision_ball2_paddle2 != 0 ||
		// 		Collisions.collision_ball1_wall === true ||
		// 		Collisions.collision_ball2_wall === true)
		// 	{
		// 		randomizeColors();
		// 	}
		// }
		
		// Randomize colors ADDITIONALLY at random times
		if (isUnlockedRandomRGB2)
		{
			if (Math.floor(Math.random() * 100) === 42)
			{
				randomizeColors();
			}
		}
	}
	
	function control_music(score1: number, score2: number): void
	{
		// console.log("control_music() - difficultyScore: " + difficultyScore);
		if (score1 + score2 < 5)
		{
			if (musicBavaria.current.paused || musicBavaria.current.ended)
			{
				// console.log("control_music() - scores: " + lastGameState.score1 + lastGameState.score2);
				musicBavaria.current.play();
				// console.log("musicBavaria.play()");
			}
		}
		else if (score1 + score2 < 10)
		{
			musicBavaria.current.pause();
			if (musicMushroomKingdom.current.paused || musicMushroomKingdom.current.ended)
			{
				musicMushroomKingdom.current.play();
			}
		}
		else if (score1 + score2 < 15)
		{
			musicMushroomKingdom.current.pause();
			if (musicNumberOne.current.paused || musicNumberOne.current.ended)
			{
				musicNumberOne.current.play();
			}
		}
		else if (score1 + score2 < 25)
		{
			musicNumberOne.current.pause();
			if (musicSpaceDyeVest.current.paused || musicSpaceDyeVest.current.ended)
			{
				musicSpaceDyeVest.current.play();
			}
		}
		else if (score1 + score2 < 35)
		{
			musicSpaceDyeVest.current.pause();
			if (musicStubb.current.paused || musicStubb.current.ended)
			{
				musicStubb.current.play();
			}
		}
		else
		{
			musicStubb.current.pause()
		}
	}
	
	// function gnome_swap_1_2(): void
	// {
	// 	let temp_ball1X: number = ball1X;
	// 	let temp_ball1Y: number = ball1Y;
	// 	let temp_ball1DirX: number = ball1DirY;
	// 	let temp_ball1DirY: number = ball1DirY;
		
	// 	ball1X = ball2X;
	// 	ball1Y = ball2Y;
	// 	ball1DirX = ball2DirX;
	// 	ball1DirY = ball2DirY;
		
	// 	ball2X = temp_ball1X;
	// 	ball2Y = temp_ball1Y;
	// 	ball2DirX = temp_ball1DirX;
	// 	ball2DirY = temp_ball1DirY;
	// }
	
	// function gnome_swap_1_fox(): void
	// {
	// 	let temp_ball1X: number = ball1X;
	// 	let temp_ball1Y: number = ball1Y;
	// 	let temp_ball1DirX: number = ball1DirY;
	// 	let temp_ball1DirY: number = ball1DirY;
		
	// 	ball1X = foxPosX;
	// 	ball1Y = foxPosY;
	// 	ball1DirX = foxDirX;
	// 	ball1DirY = foxDirY;
		
	// 	foxPosX = temp_ball1X;
	// 	foxPosY = temp_ball1Y;
	// 	foxDirX = temp_ball1DirX;
	// 	foxDirY = temp_ball1DirY;
	// }
	
	// function gnome_swap_2_fox(): void
	// {
	// 	let temp_ball2X: number = ball2X;
	// 	let temp_ball2Y: number = ball2Y;
	// 	let temp_ball2DirX: number = ball2DirY;
	// 	let temp_ball2DirY: number = ball2DirY;
		
	// 	ball2X = foxPosX;
	// 	ball2Y = foxPosY;
	// 	ball2DirX = foxDirX;
	// 	ball2DirY = foxDirY;
		
	// 	foxPosX = temp_ball2X;
	// 	foxPosY = temp_ball2Y;
	// 	foxDirX = temp_ball2DirX;
	// 	foxDirY = temp_ball2DirY;
	// }
	
	// function gnome_swap(): void
	// {
	// 	if (isUnlockedSecondBall)
	// 	{
	// 		if (Math.floor(Math.random() * 100) % 2 === 0)
	// 		{
	// 			gnome_swap_1_2();
	// 		}
	// 		if (Math.floor(Math.random() * 100) % 2 === 0)
	// 		{
	// 			gnome_swap_1_fox();
	// 		}
	// 		if (Math.floor(Math.random() * 100) % 2 === 0)
	// 		{
	// 			gnome_swap_2_fox();
	// 		}
	// 	}
	// 	else if (isUnlockedFox)
	// 	{
	// 		if (Math.floor(Math.random() * 100) % 2 === 0)
	// 		{
	// 			gnome_swap_1_fox();
	// 		}
	// 	}
	// }
	
	// function harkinian_hit(random_number: number): void
	// {
	// 	var mod: number = 1;
		
	// 	if (isUnlockedSecondBall)
	// 	{
	// 		mod = 3;
	// 	}
	// 	else if (isUnlockedFox)
	// 	{
	// 		mod = 2;
	// 	}
		
	// 	if (random_number % mod === 0)
	// 	{
	// 		harkinianX = ball1X - harkinianWidth / 2;
	// 		harkinianY = ball1Y - harkinianHeight / 2;
	// 		ball1DirX = -ball1DirX;
	// 		ball1DirY = -ball1DirY;
	// 	}
	// 	else if (random_number % mod === 1)
	// 	{
	// 		harkinianX = foxPosX - harkinianWidth / 2;
	// 		harkinianY = foxPosY - harkinianHeight / 2;
	// 		foxDirX = -foxDirX;
	// 		foxDirY = -foxDirY;
	// 	}
	// 	else if (random_number % mod === 2)
	// 	{
	// 		harkinianX = ball2X - harkinianWidth / 2;
	// 		harkinianY = ball2Y - harkinianHeight / 2;
	// 		ball2DirX = -ball2DirX;
	// 		ball2DirY = -ball2DirY;
	// 	}
	// }
	
	function mcrolld(ctx: CanvasRenderingContext2D, score1: number, score2: number): void
	{
		if (score1 + score2 >= 35)
		{
			if (mcrolldReverseQueued && (videoMcrolld.current.paused || videoMcrolld.current.ended))
			{
				setVideoToDraw(videoMcrolldReverse.current);
				videoMcrolldReverse.current.play();
				setMcrolldReverseQueued(false);
				setMcrolldQueued(true);
			}
			else if (mcrolldQueued && (videoMcrolldReverse.current.paused || videoMcrolldReverse.current.ended))
			{
				setVideoToDraw(videoMcrolld.current);
				videoMcrolld.current.play();
				setMcrolldQueued(false);
				setMcrolldReverseQueued(true);
			}
			if (mcrolldQueued)
			{
				ctx.drawImage(videoMcrolldReverse.current, (canvasRef.current.width - 1024 * resizingFactor) / 2, (canvasRef.current.height - 768 * resizingFactor) / 2, 1024 * resizingFactor, 768 * resizingFactor);
			}
			else if (mcrolldReverseQueued)
			{
				ctx.drawImage(videoMcrolld.current, (canvasRef.current.width - 1024 * resizingFactor) / 2, (canvasRef.current.height - 768 * resizingFactor) / 2, 1024 * resizingFactor, 768 * resizingFactor);
			}
			// ctx.drawImage(videoToDraw, (canvasWidth - 1024) / 2, (canvasHeight - 768) / 2, 1024, 768);
		}
	}
	
	function popup_trap(score1: number, score2: number, trigger: boolean): void
	{
		if (score1 + score2 >= 10) //isUnlockedPopups
		{
			if (trigger === true) //(Math.floor(Math.random() * 10000) === 666)
			{
				var selector = Math.floor(Math.random() * 100) % 11; // % 5
				if (selector === 0)
				{
					alert("Run!");
				}
				else if (selector === 1)
				{
					alert("Hide!");
				}
				else if (selector === 2)
				{
					alert("Resist!");
				}
				else if (selector === 3)
				{
					alert("Fight!");
				}
				else if (selector === 4)
				{
					alert("Dog!");
				}
				else if (selector === 5)
				{
					alert("Try rump!");
				}
				else if (selector === 6)
				{
					alert("Be wary of danger!");
				}
				else if (selector === 7)
				{
					alert("Seek grace!");
				}
				else if (selector === 8)
				{
					alert("Visions of madness!");
				}
				else if (selector === 9)
				{
					alert("Ahh, suffering...");
				}
				else if (selector === 10)
				{
					alert("Praise the faith!");
				}
			}
		}
	}
	
	// function updateVariables(): void
	// {
	// 	ball1SpeedX = ballGlobalSpeedDefault + ballGlobalSpeedAddedPerma + ballGlobalSpeedAddedTemp;
	// 	ball1SpeedY = ballGlobalSpeedDefault + ballGlobalSpeedAddedPerma + ballGlobalSpeedAddedTemp;
	// 	ball2SpeedX = ballGlobalSpeedDefault + ballGlobalSpeedAddedPerma + ballGlobalSpeedAddedTemp;
	// 	ball2SpeedY = ballGlobalSpeedDefault + ballGlobalSpeedAddedPerma + ballGlobalSpeedAddedTemp;
		
	// 	// Upon losing the ball
	// 	if (Collisions.ball1_loser != 0)
	// 	{
	// 		ballPaddleBounces = 0;
	// 		ballGlobalSpeedAddedTemp = 0;
			
	// 		// Reset dir for Ball 1
	// 		if (Math.floor(Math.random() * 100) % 2 === 0)
	// 		{
	// 			ball1DirX = -1;
	// 		}
	// 		else
	// 		{
	// 			ball1DirX = 1;
	// 		}
	// 		if (Math.floor(Math.random() * 100) % 2 === 0)
	// 		{
	// 			ball1DirY = -1;
	// 		}
	// 		else
	// 		{
	// 			ball1DirY = 1;
	// 		}
	// 	}
	// 	if (Collisions.ball2_loser != 0)
	// 	{
	// 		ballPaddleBounces = 0;
	// 		ballGlobalSpeedAddedTemp = 0;
			
	// 		// Reset dir for Ball 2
	// 		if (Math.floor(Math.random() * 100) % 2 === 0)
	// 		{
	// 			ball2DirX = -1;
	// 		}
	// 		else
	// 		{
	// 			ball2DirX = 1;
	// 		}
	// 		if (Math.floor(Math.random() * 100) % 2 === 0)
	// 		{
	// 			ball2DirY = -1;
	// 		}
	// 		else
	// 		{
	// 			ball2DirY = 1;
	// 		}
	// 	}
	// }
	
	// function updateScores(): void
	// {
	// 	// Ball 1
	// 	if (Collisions.ball1_loser === 1)
	// 	{
	// 		scoreP2++;
	// 	}
	// 	else if (Collisions.ball1_loser === 2)
	// 	{
	// 		scoreP1++;
	// 	}
		
	// 	// Ball 2
	// 	if (isUnlockedSecondBall)
	// 	{
	// 		if (Collisions.ball2_loser === 1)
	// 		{
	// 			scoreP2++;
	// 		}
	// 		else if (Collisions.ball2_loser === 2)
	// 		{
	// 			scoreP1++;
	// 		}
	// 	}			
	// }
	
	function difficultyHandler(score1: number, score2: number): void
	{
		// console.log("difficultyHandler() - difficultyScore: " + difficultyScore);
		// console.log("difficultyHandler() - scores: " + score1 + ", " + score2);
		// When total score reaches 5
		if (score1 + score2 === 5 && difficultyScore < 5)
		{
			setDifficultyScore(5);
			setIsUnlockedGnome(true);
		}
		else if (score1 + score2 === 10 && difficultyScore < 10)
		{
			setDifficultyScore(10);
			setIsUnlockedRandomRGB2(true);
			// setIsUnlockedRandomRGB1(true);
		}
		else if (score1 + score2 === 15 && difficultyScore < 15)
		{
			setDifficultyScore(15);
			setIsUnlockedRandomRGB1(false);
			setIsUnlockedRandomRGB2(false);
			setColorCodeRGBBackground("000000");
			setColorCodeRGBScore("CCCCCC");
			setColorCodeRGBBall1("CCCCCC");
			setColorCodeRGBBall2("CCCCCC");
			setColorCodeRGBP1("CCCCCC");
			setColorCodeRGBP2("CCCCCC");
			setIsUnlockedHarkinian(true);
			setIsUnlockedSubliminal1(true);
		}
		else if (score1 + score2 === 20 && difficultyScore < 20)
		{
			setDifficultyScore(20);
		}
		else if (score1 + score2 === 25 && difficultyScore < 25)
		{
			setDifficultyScore(25);
			setIsUnlockedRandomRGB1(true);
			setIsUnlockedRandomRGB2(true);
			setIsUnlockedSubliminal2(true);
		}
		else if (score1 + score2 === 30 && difficultyScore < 30)
		{
			setDifficultyScore(30);
			setIsUnlockedFox(true);
		}
		else if (score1 + score2 === 35 && difficultyScore < 35)
		{
			setDifficultyScore(35);
			setIsUnlockedVideo(true);
			setIsUnlockedSubliminal3(true);
		}
		else if (score1 + score2 === 40 && difficultyScore < 40)
		{
			setDifficultyScore(40);
			setIsUnlockedSecondBall(true);
		}
		else if (score1 + score2 === 45 && difficultyScore < 45)
		{
			setDifficultyScore(45);
		}
		else if (score1 + score2 === 50 && difficultyScore < 50)
		{
			setDifficultyScore(50);
			setIsUnlockedPopups(true);
		}
		// adjust_ballAndPaddle();
	}
	
	// Permanent adjustments to the balls and paddles
	// function adjust_ballAndPaddle(): void
	// {
	// 	if (Collisions.collision_ball1_paddle1 != 0 || Collisions.collision_ball1_paddle2 != 0)
	// 	{
	// 		ballPaddleBounces++;
	// 	}
	// 	if (isUnlockedSecondBall &&
	// 		(Collisions.collision_ball2_paddle1 != 0 || Collisions.collision_ball2_paddle2 != 0))
	// 	{
	// 		ballPaddleBounces++;
	// 	}
		
	// 	ballGlobalSpeedAddedTemp = ballPaddleBounces * 0.3;
	
	// 	if (difficultyScore % 5 === 0 &&
	// 		difficultyScore > 0 &&
	// 		difficultyBallAndPaddle < Math.floor(difficultyScore / 5))
	// 	{
	// 		if (Math.floor(Math.random() * 100) % 2 === 0 || paddleGlobalWidth - paddleGlobalReduction === 35)
	// 		{
	// 			ballGlobalSpeedAddedPerma = ballGlobalSpeedAddedPerma + 0.5;
	// 			foxSpeed = foxSpeedDefault + ballGlobalSpeedAddedPerma;
	// 		}
	// 		else
	// 		{
	// 			paddleGlobalReduction = paddleGlobalReduction + 5;
	// 		}
	// 		difficultyBallAndPaddle++;
	// 	}
	// }

	function drawSubliminalDepression(ctx: CanvasRenderingContext2D): void
	{
		if (subliminalDepressionIsActive === false)
		{
			// setSubliminalSelectorDepression(Math.floor(Math.random() * 100) % (subliminalMessagesArrayDepression.length));
			setSubliminalDepressionIsActive(true);
		}

		// Background
		ctx.beginPath();
		ctx.rect(0, 0, canvasRef.current.width, canvasRef.current.height);
		ctx.fillStyle = "#000000";
		ctx.fill();
		ctx.closePath();

		// Text
		ctx.font = "110px Sherwood";
		ctx.textAlign = 'center'; // Horizontal centering
		ctx.textBaseline = 'middle'; // Vertical centering
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(`${subliminalMessagesArrayDepression[subliminalSelectorDepression]}`, canvasRef.current.width / 2, canvasRef.current.height / 2);
	}

	function drawSubliminalSchizophrenia(ctx: CanvasRenderingContext2D): void
	{
		if (subliminalSchizophreniaIsActive === false)
		{
			// setSubliminalSelectorSchizophrenia(Math.floor(Math.random() * 100) % (subliminalMessagesArraySchizophrenia.length));
			setSubliminalSchizophreniaIsActive(true);
		}

		// Background
		ctx.beginPath();
		ctx.rect(0, 0, canvasRef.current.width, canvasRef.current.height);
		ctx.fillStyle = "#000000";
		ctx.fill();
		ctx.closePath();

		// Text
		ctx.font = "110px Sherwood";
		ctx.textAlign = 'center'; // Horizontal centering
		ctx.textBaseline = 'middle'; // Vertical centering
		ctx.fillStyle = 'yellow';
		ctx.fillText(`${subliminalMessagesArraySchizophrenia[subliminalSelectorSchizophrenia]}`, canvasRef.current.width / 2, canvasRef.current.height / 2);
	}

	function drawSubliminalHellish(ctx: CanvasRenderingContext2D): void
	{
		if (subliminalHellishIsActive === false)
		{
			// setSubliminalSelectorHellish(Math.floor(Math.random() * 100) % (subliminalMessagesArrayHellish.length));
			setSubliminalHellishIsActive(true);
		}

		// Background
		ctx.beginPath();
		ctx.rect(0, 0, canvasRef.current.width, canvasRef.current.height);
		ctx.fillStyle = "#000000";
		ctx.fill();
		ctx.closePath();

		// Text
		ctx.font = "110px Sherwood";
		ctx.textAlign = 'center'; // Horizontal centering
		ctx.textBaseline = 'middle'; // Vertical centering
		ctx.fillStyle = '#FF0000';
		ctx.fillText(`${subliminalMessagesArrayHellish[subliminalSelectorHellish]}`, canvasRef.current.width / 2, canvasRef.current.height / 2);
	}

	function drawSubliminalMessages(ctx: CanvasRenderingContext2D, timestamp: number): void
	{
		if (subliminalDepressionIsActive || subliminalSchizophreniaIsActive || subliminalHellishIsActive)
		{
			if (timestamp - subliminalStartTime >= 100)
			{
				setSubliminalDepressionIsActive(false);
				setSubliminalSchizophreniaIsActive(false);
				setSubliminalHellishIsActive(false);

				setSubliminalSelectorDepression(Math.floor(Math.random() * 100) % (subliminalMessagesArrayDepression.length));
				setSubliminalSelectorSchizophrenia(Math.floor(Math.random() * 100) % (subliminalMessagesArraySchizophrenia.length));
				setSubliminalSelectorHellish(Math.floor(Math.random() * 100) % (subliminalMessagesArrayHellish.length));
			}
			if (subliminalDepressionIsActive === true)
			{
				drawSubliminalDepression(ctx);
			}
			else if (subliminalSchizophreniaIsActive === true)
			{
				drawSubliminalSchizophrenia(ctx);
			}
			else if (subliminalHellishIsActive === true)
			{
				drawSubliminalHellish(ctx);
			}
		}
		else if (Math.floor(Math.random() * 200) === 42)
		{
			setSubliminalStartTime(timestamp);

			if (isUnlockedSubliminal3 === true)
			{
				drawSubliminalHellish(ctx);
			}
			else if (isUnlockedSubliminal2 === true)
			{
				drawSubliminalSchizophrenia(ctx);
			}
			else if (isUnlockedSubliminal1 === true)
			{
				drawSubliminalDepression(ctx);
			}
		}
	}

	var KeysPressed: KeyPresses =
	{
		keyArrowUp: false,
		keyArrowDown: false,
		keySpace: false
	}

	var keyString: string = "";
	
	useEffect(() => {
		// Function to handle key down event
		const handleKeyDown = (event: KeyboardEvent) =>
		{
			if (event.key === 'ArrowUp' || event.key === 'Up')
			{
				event.preventDefault();
				KeysPressed.keyArrowUp = true;
			}
			if (event.key === 'ArrowDown' || event.key === 'Down')
			{
				event.preventDefault();
				KeysPressed.keyArrowDown = true;
			}
			if (event.key === 'Space' || event.key === ' ')
			{
				event.preventDefault();
				KeysPressed.keySpace = true;
			}
			
			// console.log("FE - handleKeyDown() - key: " + event.key);
			// console.log("FE - handleKeyDown() - KeysPressed.keyArrowUp: " + KeysPressed.keyArrowUp);
			keyString = "";

			if (KeysPressed.keyArrowUp === true)
			{
				keyString = "ARROWUP";
			}
			else if (KeysPressed.keyArrowDown === true)
			{
				keyString = "ARROWDOWN";
			}
			if (KeysPressed.keySpace === true && keyString != "")
			{
				keyString = keyString + "+SPACE";
			}
			
			// console.log("FE - keyString: " + keyString);
			socket.emit('keypress', keyString);
		};
	
		// Function to handle key up event
		const handleKeyUp = (event: KeyboardEvent) =>
		{
			if (event.key === 'ArrowUp' || event.key === 'Up')
			{
				KeysPressed.keyArrowUp = false;
			}
			if (event.key === 'ArrowDown' || event.key === 'Down')
			{
				KeysPressed.keyArrowDown = false;
			}
			if (event.key === 'Space' || event.key === ' ')
			{
				KeysPressed.keySpace = false;
			}
			
			keyString = "";

			if (KeysPressed.keyArrowUp === true)
			{
				keyString = "ARROWUP";
			}
			else if (KeysPressed.keyArrowDown === true)
			{
				keyString = "ARROWDOWN";
			}
			if (KeysPressed.keySpace === true && keyString != "")
			{
				keyString = keyString + "+SPACE";
			}

			socket.emit('keypress', keyString);
		};
	
		// Attach event listeners when the component mounts
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
	
		// Clean up event listeners when the component unmounts
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
		};
	
	}, []);

	const [receivedGameState, setReceivedGameState] = useState<GameState | null>(null);

	// const [unlockedGnome, setUnlockedGnome] = useState<boolean>(false);

	// var lastGameState: GameState =
	// {
	// 	score1: 0,
	// 	score2: 0,
	// 	paddle1:
	// 	{
	// 		x: 0,
	// 		y: (canvasRef.current.height / 2)
	// 	},
	// 	paddle2:
	// 	{
	// 		x: canvasRef.current.width - 50 * resizingFactor,
	// 		y: (canvasRef.current.height / 2)
	// 	},
	// 	ball:
	// 	{
	// 		x: (canvasRef.current.width / 2),
	// 		y: (canvasRef.current.height / 2)
	// 	},
	// 	ball2:
	// 	{
	// 		x: (canvasRef.current.width / 2),
	// 		y: (canvasRef.current.height / 2)
	// 	},
	// 	ball2lock: false,
	// 	// gnome:
	// 	// {
	// 	// 	isUnlocked: false,
	// 	// },
	// 	harkinian:
	// 	{
	// 		pos:
	// 		{
	// 			x: 0,
	// 			y: 0
	// 		}
	// 	// 	isUnlocked: false
	// 	},
	// 	fox:
	// 	{
	// 		isUnlocked: false,
	// 		isEvil: false,
	// 		isEnraged: false,
	// 		hasSizeOf: 100,
	// 		pos:
	// 		{
	// 			x: (canvasRef.current.width / 2),
	// 			y: (canvasRef.current.height / 2)
	// 		},
	// 	},
	// 	triggers:
	// 	{
	// 		triggeredGnome: false,
	// 		triggeredHarkinian: false,
	// 		triggeredPopup: false
	// 	}
	// }

	// function updateGameState(): void
	// {
	// 	lastGameState = receivedGameState;
	// }

	function prepareKeyString(): void
	{
		keyString = "";
		// console.log("FE - prepareKeyString(): up, down, space: " + KeysPressed.keyArrowUp + ", " + KeysPressed.keyArrowDown + ", " + KeysPressed.keySpace);
		if (KeysPressed.keyArrowUp === true)
		{
			keyString = "ARROWUP";
		}
		else if (KeysPressed.keyArrowDown === true)
		{
			keyString = "ARROWDOWN";
		}
		if (KeysPressed.keySpace === true && keyString != "")
		{
			keyString = keyString + "+SPACE";
		}
	}

	function sendKeystrokes(): void
	{
		prepareKeyString();
		// console.log("FE - keyString: " + keyString);
		socket.emit('keypress', keyString);
	}

	const socket = useContext(WebsocketContext);

	useEffect(() => {
		socket.on('GameLoop', (newState: GameState) => {
			if (newState.ball.x !== undefined && newState.ball.y !== undefined)
			{
				setReceivedGameState(newState);
				// lastGameState = newState;
				// lastGameState = receivedGameState;
				// console.log("ball x: " + lastGameState.ball.x);
			}
		});

		socket.on('disconnect', () => {
			console.log('Socket.io connection disconnected.');
		});
	}, [socket]);

	useEffect(() =>
	{
		// let frameCount: number = 0;

		// const eventName = `GameLoop`;
        // socket.on(eventName, (newState: GameState) => {
		// 	if (newState.ball && typeof newState.ball.x !== 'undefined')
		// 	{
		// 		setReceivedGameState(newState);
		// 		lastGameState = newState;
		// 		// lastGameState = receivedGameState;
		// 		// console.log("ball x: " + lastGameState.ball.x);
		// 	}
        // });
	
		// const sendMessageToBackend = () => {
		//   socket.emit('sendToBackend', paddleP1X);
		// //   console.log("FRONTEND Sent data to backend: " + paddleP1X);
		// };
	
		if (canvasRef.current && receivedGameState)
		{
			const context = canvasRef.current.getContext('2d');

			canvasRef.current.width = backendWidth * resizingFactor;
			canvasRef.current.height = backendHeight * resizingFactor;

			// const drawClassic = (timestamp: number) =>
			// {
			// 	// if (!thenRef.current)
			// 	// {
			//   	// 	thenRef.current = timestamp;
			//   	// 	startTimeRef.current = timestamp;
			// 	// }

			// 	// const elapsed: number = timestamp - thenRef.current;
			// 	// const interval: number = 1000 / frameRate;

			// 	// if (elapsed > interval)
			// 	// {
			// 	// 	thenRef.current = timestamp - (elapsed % interval);

			// 		context.clearRect(0, 0, canvasWidth, canvasHeight);

			// 		updateGameState();
			// 		// sendKeystrokes();
	
			// 		drawBackground(context);
			
			// 		drawBalls(context);
			// 		// drawBallFromBackend(context, receivedGameState);
			// 		drawPaddles(context);
			
			// 		drawScore(context);
			
			// 		// updateVariables();
			
			// 		// collisionCheck();
			
			// 		// movePaddles();
			// 		// moveBalls();
			
			// 		// updateVariables();
			// 		// updateScores();

			// 	// 	frameCount++;
			// 	// }

			// 	requestAnimationFrame(drawClassic);
		  	// };

			// const drawEnhanced = (timestamp: number) =>
			// {
				// if (!thenRef.current)
				// {
			  	// 	thenRef.current = timestamp;
			  	// 	startTimeRef.current = timestamp;
				// }

				// const elapsed: number = timestamp - thenRef.current;
				// const interval: number = 1000 / frameRate;

				// if (elapsed > interval)
				// {
				// 	thenRef.current = timestamp - (elapsed % interval);

					// lastGameState = receivedGameState;

					context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

					// updateGameState();
					// sendKeystrokes();
	
					drawBackground(context); // DONE
					
					mcrolld(context, receivedGameState.score1, receivedGameState.score2);

					if (receivedGameState.score1 + receivedGameState.score2 < 35)
					{
						drawSubliminalMessages(context, Date.now());
					}
					
					drawBalls(context, receivedGameState.ball.x, receivedGameState.ball.y, receivedGameState.ball2lock, receivedGameState.ball2.x, receivedGameState.ball2.y); // DONE
					
					drawPaddles(context, receivedGameState.paddle1.x, receivedGameState.paddle1.y, receivedGameState.paddle2.x, receivedGameState.paddle2.y); // DONE
					// console.log("FE - fox.isUnlocked: " + receivedGameState.fox.isUnlocked);
					drawFox(context, receivedGameState.score1, receivedGameState.score2, receivedGameState.fox.isUnlocked, receivedGameState.fox.isEvil, receivedGameState.fox.isEnraged, receivedGameState.fox.triggeredEnrage, receivedGameState.collisionFoxPaddle1, receivedGameState.collisionFoxPaddle2, receivedGameState.fox.pos.x, receivedGameState.fox.pos.y); // DONE
					
					// console.log("FE - main loop - START");
					// console.log("FE - main loop - unlockedGnome: " + unlockedGnome);
					// setUnlockedGnome(!unlockedGnome);
					// console.log("FE - main loop - unlockedGnome: " + unlockedGnome);
					// console.log("FE - main loop - END");
					drawGnome(context, receivedGameState.score1, receivedGameState.score2, receivedGameState.triggers.triggeredGnome, receivedGameState.ball.x, receivedGameState.ball.y, receivedGameState.ball2.x, receivedGameState.ball2.y, receivedGameState.fox.pos.x, receivedGameState.fox.pos.y, Date.now());
					drawHarkinian(context, receivedGameState.score1, receivedGameState.score2, receivedGameState.triggers.triggeredHarkinian, receivedGameState.harkinian.pos.x, receivedGameState.harkinian.pos.y);
					drawScore(context, receivedGameState.score1, receivedGameState.score2); // DONE

					if (receivedGameState.score1 + receivedGameState.score2 >= 35)
					{
						drawSubliminalMessages(context, Date.now());
					}
			
					// updateVariables();
			
					// collisionCheck();
					control_music(receivedGameState.score1, receivedGameState.score2); // DONE
					control_RGB(); // Random RGB from collisions DEACTIVATED
			
					// movePaddles();
					// moveBalls();
					// moveFox(timestamp);
			
					popup_trap(receivedGameState.score1, receivedGameState.score2, receivedGameState.triggers.triggeredPopup);
			
					// updateVariables();
					// updateScores();
					difficultyHandler(receivedGameState.score1, receivedGameState.score2);

					// sendMessageToBackend();

				// 	frameCount++;
				// }

			// 	requestAnimationFrame(drawEnhanced);
			// };

			// const calculateFrameRate = () =>
			// {
			// 	const now: number = performance.now();
			// 	const elapsed: number = now - startTimeRef.current!;

			// 	if (elapsed >= 1000)
			// 	{
			// 		const fps: number = (frameCount / elapsed) * 1000;
			// 		// console.log(`Frame rate: ${fps.toFixed(2)} FPS`);

			// 		frameCount = 0; // Reset frameCount

			// 		startTimeRef.current = now;
			// 	}

			// 	requestAnimationFrame(calculateFrameRate);
			// };

			// calculateFrameRate();
			// if (classicMode === true)
			// {
			// 	ballGlobalSpeedDefault = 7;
			// 	requestAnimationFrame(drawClassic);
			// }
			// else
			// 	requestAnimationFrame(drawEnhanced);
		}

		// return () => {
        //     console.log("Unregistering Events...");
        //     socket.off('GameLoop');
        // };
	}, [receivedGameState, resizingFactor]); //frameRate

	// function drawBallFromBackend(ctx: CanvasRenderingContext2D, backendFrame: GameState): void
	// {
	// 	ctx.beginPath();
	// 	// console.log("backendFrame.ball: " + backendFrame.ball.x + ", " + backendFrame.ball.y);
	// 	// console.log("ballFromBackend X and Y: " + ballFromBackendX + ", " + ballFromBackendY);
	// 	// ctx.arc(backendFrame.ball.x, backendFrame.ball.y, ballGlobalRadius, 0, Math.PI * 2);
	// 	ctx.arc(ballFromBackendX, ballFromBackendY, ballGlobalRadius, 0, Math.PI * 2);
	// 	ctx.fillStyle = "#FF0000";
	// 	ctx.fill();
	// 	ctx.closePath();
	// }
	
	return (
		<div>
			{/* <JoinRandom /> */}
			<JoinRandomPlus />
			<canvas
				ref={canvasRef}
				// width="1200"
				// height="720"
				// style={{ border: "1px solid black" }}
				style={{ border: "1px solid black", width: '100%', height: '100%', display: 'block' }}
			></canvas>
			<audio ref={audioGnome}>
        		<source src={audioGnomeSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={audioHarkinianHit}>
        		<source src={audioHarkinianHitSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={audioHarkinianOah}>
        		<source src={audioHarkinianOahSrc} type="audio/mp3"/>
      		</audio>
			  <audio ref={audioFoxMeow}>
        		<source src={audioFoxMeowSrc} type="audio/mp3"/>
      		</audio>
			  <audio ref={audioFoxWoof}>
        		<source src={audioFoxWoofSrc} type="audio/mp3"/>
      		</audio>
			  <audio ref={audioFoxQuack}>
        		<source src={audioFoxQuackSrc} type="audio/mp3"/>
      		</audio>
			  <audio ref={audioFoxChicken}>
        		<source src={audioFoxChickenSrc} type="audio/mp3"/>
      		</audio>
			  <audio ref={audioFoxGoat}>
        		<source src={audioFoxGoatSrc} type="audio/mp3"/>
      		</audio>
			  <audio ref={audioFoxPig}>
        		<source src={audioFoxPigSrc} type="audio/mp3"/>
      		</audio>
			  <audio ref={audioFoxTweet}>
        		<source src={audioFoxTweetSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={audioFoxAhee}>
        		<source src={audioFoxAheeSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={audioFoxCha}>
        		<source src={audioFoxChaSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={audioFoxKaka}>
        		<source src={audioFoxKakaSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={audioFoxPapa}>
        		<source src={audioFoxPapaSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={audioFoxYok}>
        		<source src={audioFoxYokSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={audioFoxEnrage}>
        		<source src={audioFoxEnrageSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={musicBavaria}>
        		<source src={musicBavariaSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={musicMushroomKingdom}>
        		<source src={musicMushroomKingdomSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={musicNumberOne}>
        		<source src={musicNumberOneSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={musicSpaceDyeVest}>
        		<source src={musicSpaceDyeVestSrc} type="audio/mp3"/>
      		</audio>
			<audio ref={musicStubb}>
        		<source src={musicStubbSrc} type="audio/mp3"/>
      		</audio>
			<video ref={videoMcrolld} style={{ display: 'none' }}>
        		<source src={videoMcrolldSrc} type="video/mp4"/>
      		</video>
			  <video ref={videoMcrolldReverse} style={{ display: 'none' }}>
        		<source src={videoMcrolldReverseSrc} type="video/mp4"/>
      		</video>
			<video ref={videoHarkinianHit} style={{ display: 'none' }}>
        		<source src={videoHarkinianHitSrc} type="video/mp4"/>
      		</video>
			{/* <ReceivedGameData /> */}
		</div>
	);
};

export default Game;
