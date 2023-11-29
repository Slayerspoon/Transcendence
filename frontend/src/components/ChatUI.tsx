import { useState, useContext, useEffect } from "react";
import { Box, Input, Grid, Flex, Text, Button } from "@chakra-ui/react";
import ChatUsers from "./Chat/ChatUsers";
import ChannelsMember from "./Chat/ChannelsMember";
import ChannelsAvailable from "./Chat/ChannelsAvailable";
import { Tab, TabList, Tabs } from "@chakra-ui/react";

import { WebsocketContext } from "./Context/WebsocketContexts";

type MessagePayload = {
	content: string;
	channelId: number;
};

type ReceivedMessagePayload = {
	content: string;
	sender: string;
};

const ChatUI: React.FC = () => {
	const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
	const [sentMessage, setSentMessage] = useState<MessagePayload>({
		content: "",
		channelId: currentRoomId!,
	});
	
	const [receivedMessages, setReceivedMessages] = useState<
		ReceivedMessagePayload[]
	>([]);
	const [messageHistory, setMessageHistory] = useState<
		ReceivedMessagePayload[]
	>([]);
	const socket = useContext(WebsocketContext);

	const handleRoomChange = (roomId: number) => {
		setCurrentRoomId(roomId);
		setSentMessage({
			content: "",
			channelId: roomId, // Set the channelId to the roomId
		});
		setReceivedMessages([]);
		fetchMessageHistory(roomId);
	};

	const fetchMessageHistory = async (roomId: number) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/messages/channel/${roomId}`,
				{
					credentials: "include",
				}
			);

			if (response.status === 409) {
				setMessageHistory([]);
				return;
			}

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const data = await response.json();
			setMessageHistory(data.messages); // Assuming the JSON response is an array of messages
		} catch (error) {
			console.error("Fetching messages failed: ", error);
		}
	};

	useEffect(() => {
		// Ensure a room is selected before registering event listeners
		if (currentRoomId === null) return;

		// Dynamic event name based on `currentRoomId`
		const eventName = `channel-msg-${currentRoomId}`;

		// Event handler function
		const handleNewMessage = (newMessage: ReceivedMessagePayload) => {
			setReceivedMessages((prevMessages) => [...prevMessages, newMessage]); // This appends the new message to the array
		};

		// Register the event listener
		socket.on(eventName, handleNewMessage);

		return () => {
			// Unregister the event listener on cleanup
			console.log("Unregistering Events...");
			socket.off(eventName, handleNewMessage);
		};
	}, [socket, currentRoomId]);

	const onSubmit = () => {
		if (sentMessage.content.trim() === "") {
			alert("Message content is empty. Please enter a message.");
			return;
		}
		// const contentWithUsername = username + ": " + sentMessage.content;
		// const sentMessageJSON = { ...sentMessage, content: contentWithUsername };
		const sentMessageJSON = sentMessage;
		socket.emit("send-channel-message", sentMessageJSON);
		setSentMessage({ ...sentMessage, content: "" });
	};
	return (
		<Flex
			direction="column"
			height="calc(100vh)"
			width="100%"
			overflow="hidden"
		>
			<Flex flex="1" overflowY="hidden">
				<Box
					borderWidth={1}
					borderRadius="0"
					width="200px"
					overflowY="auto"
					height="calc(100vh - 50px)"
				>
					<Tabs isFitted variant="enclosed">
						<TabList mb="1em">
							<Tab>
								{currentRoomId ? `Room: ${currentRoomId}` : "No Room Selected"}
							</Tab>
						</TabList>
					</Tabs>
					<Text fontSize="xl" p="4">
						Chat Rooms
					</Text>
					<Text fontSize="md" p="4" fontWeight="bold">
						Rooms You've Joined
					</Text>
					<ChannelsMember onChangeRoom={handleRoomChange} />
					<Text fontSize="md" p="4" fontWeight="bold">
						Available Rooms
					</Text>
					<ChannelsAvailable onChangeRoom={handleRoomChange} />
				</Box>
				<Grid templateColumns="3fr 1fr" flex="1" overflowY="hidden">
					<Box
						borderWidth={1}
						borderRadius="0"
						overflowY="scroll"
						height="calc(100vh - 50px)"
					>
						{messageHistory.map((msg, index) => (
							<div key={index}>
								<p>
									<strong>{msg.sender}</strong>: {msg.content}
								</p>
							</div>
						))}
						{receivedMessages.map((msg, index) => (
							<div key={index}>
								<p>
									<strong>{msg.sender}</strong>: {msg.content}
								</p>
							</div>
						))}
					</Box>
					<Box
						borderWidth={1}
						borderRadius="0"
						overflowY="scroll"
						height="calc(100vh - 50px)"
					>
						<ChatUsers currentRoomId={currentRoomId} />
					</Box>
				</Grid>
			</Flex>
			<Grid templateColumns="3fr 1fr" height="50px">
				<Input
					value={sentMessage.content}
					placeholder="Type your message here"
					onChange={(e) =>
						setSentMessage({ ...sentMessage, content: e.target.value })
					}
					onKeyPress={(e) => {
						if (e.key === 'Enter') {
							onSubmit();
						}
					}}
				/>
				<Button onClick={onSubmit}>Send</Button>
			</Grid>
		</Flex>
	);
};
export default ChatUI;
