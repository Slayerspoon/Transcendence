import React, { useEffect, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import LeaveChannelButton from "./LeaveChannelButton";

type ChannelType = "PUBLIC" | "PROTECTED" | "PRIVATE";

interface Channel {
	id: number;
	title: string;
	creatorId: number;
	channelType: ChannelType;
}

interface Channels {
	channelsNo: number;
	channels: Channel[];
}

interface ChannelsMemberProps {
	onChangeRoom: (roomId: number) => void;
}

const ChannelsMember: React.FC<ChannelsMemberProps> = ({ onChangeRoom }) => {
	const [channels, setChannels] = useState<Channels>({
		channelsNo: 0,
		channels: [],
	});

	useEffect(() => {
		const fetchChannels = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/chat/channel/memberships`,
					{
						credentials: "include",
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch channels");
				}

				const data: Channels = await response.json();
				setChannels(data);
			} catch (error) {
				console.error("Error fetching channels:", error);
			}
		};

		fetchChannels();
	}, []);

	// return (
	// 	<div>
	// 		{channels.channelsNo > 0 ? (
	// 			<ul>
	// 				{channels.channels.map((channel) => (
	// 					<li key={channel.id}>
	// 						<button onClick={() => onChangeRoom(channel.id)}>
	// 							{channel.title}
	// 						</button>
	// 						<LeaveChannelButton channelId={channel.id} />
	// 					</li>
	// 				))}
	// 			</ul>
	// 		) : (
	// 			<p>No channels found</p>
	// 		)}
	// 	</div>
	// );
	return (
		<Box>
		  {channels.channelsNo > 0 ? (
			<ul>
			  {channels.channels.map((channel) => (
				<li key={channel.id}>
				  <Button
					onClick={() => onChangeRoom(channel.id)}
					size='md' // Adjust the size, e.g., 'sm', 'md', 'lg'
					// background={`radial-gradient(ellipse, rgba(200, 150, 100, 1), rgba(200, 150, 100, 0))`}
					// backgroundColor='rgb(175, 75, 100)' // Set the default background color
					backgroundColor='rgb(200, 150, 100)' // Set the default background color
					_hover={{
					  backgroundColor: 'teal.500', // Customize the background color on hover
					  color: 'white', // Customize the text color on hover
					}}
					py='4' // Adjust the vertical padding
					px='4'
                	fontSize='lg' // Adjust the font size for the text
					border='1px' // Add a 2-pixel border
            		borderColor='brown.500' // Border color
				  >
					{channel.title}
				  </Button>
				  <LeaveChannelButton channelId={channel.id} />
				</li>
			  ))}
			</ul>
		  ) : (
			<p>No channels found</p>
		  )}
		</Box>
	  );
};

export default ChannelsMember;
