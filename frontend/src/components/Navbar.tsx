import { useEffect, useState, useContext } from "react";
import { Avatar, Flex, Text, Heading, Spacer, HStack } from "@chakra-ui/react";
import { TwoFAComponent } from "./TwoFAComponent"; // Import the TwoFAComponent
import { WebsocketContext } from "./Context/WebsocketContexts";

var i: number = 1;

interface User {
	id: string;
	username: string;
	isOnline: boolean;
	avatar: string;
	is2FaActive: boolean; // Assuming the API returns this field
	is2FaValid?: boolean;
}

interface NavbarProps {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({
	isLoggedIn,
	setIsLoggedIn,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [showUser, setShowUser] = useState(false);
	const socket = useContext(WebsocketContext);

	const setupSocketConnection = (userId: string) => {
		socket.open();
		console.log("Socket Connection Established");
	};

	const check2FAStatus = async () => {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/2fa/is2faactive`,
			{
				credentials: "include",
			}
		);
	
		const isActive = await response.json();
	
		return isActive;
	}

	const validateUser = async () => {
		const is2FaActive = await check2FAStatus(); // Notice the await keyword here
	
		if (!is2FaActive) {
			fetchUserData();
		} else {
			// request 2fa Token until 2fa is active
			fetchUserData();
		}
	};

	const fetchUserData = () => {
		fetch(`${import.meta.env.VITE_API_URL}/profile`, {
			credentials: "include",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Not logged in");
				}
				return response.json();
			})
			.then((data) => {
				setUser(data);
				setShowUser(true);
				setIsLoggedIn(true);
				setupSocketConnection(data.id);
			})
			.catch((error) => {
				console.error("Fetch error:", error);
				setIsLoggedIn(false);
			});
	};

	async function handleFetchToggle2FAuthOff() {
    try {
      const response = await fetch(
        `http://localhost:4000/2fa/deactivate`,
        {
          method: "PATCH",
          credentials: "include",
          // 'Access-Control-Allow-Credentials': 'true',
          // 'Access-Control-Allow-Origin': 'http://localhost:5173',
        }
      );
      if (response.ok) {
        alert("2Fauth deactivated successfully");
      } else {
        throw new Error("Failed to deactivate 2Fauth.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
    // window.location.reload();
  }


	const handleLogout = () => {
		fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
			credentials: "include",
		}).then((response) => response.json());
		setShowUser(false);
		setIsLoggedIn(false);
		
		socket.close();
		console.log("Socket Connection Closed");
	};

	// Function to handle successful 2FA verification
	// const handle2FASuccess = () => {
		// console.log("2FA verified successfully.");
		// Redirect the user to the main page or reload the current page
		// window.location.href = '/main-page-url';
	// };

	useEffect(() => {
		// const is2FaActive = await check2FAStatus();
		// if(is2FaActive && !isLoggedIn)
		// {
// 
		// }
		fetchUserData();
		// validateUser();
	}, []);

	let handleLogin = () => {
		window.location.href = `${import.meta.env.VITE_API_URL}/auth/42/login`;
	};

	return (
		<Flex as="nav" p="10x" mb="40px" alignItems="center" gap="10px">
			<Heading
				as="h1"
				color="silver"
				style={{ fontFamily: "'IM Fell English SC', serif" }}
			>
				Transcendence
			</Heading>
			<Spacer />
			<HStack spacing="10px" height="120px">
				{showUser && user?.username && (
					<Text color="silver" fontSize={"30px"}>
						{user.username}
					</Text>
				)}
				{showUser && user?.username && (
					<Avatar name="avatar" src={user.avatar} background="purple"></Avatar>
				)}
				{isLoggedIn ? (
					<button
						style={{ color: "silver", fontSize: "30px" }}
						onClick={handleLogout}
					>
						Logout
					</button>
				) : (
					<button
						style={{ color: "silver", fontSize: "30px", alignItems: "right" }}
						onClick={handleLogin}
					>
						Login
					</button>
				)}
			</HStack>
			{(!isLoggedIn) && (<TwoFAComponent/>)} 
		</Flex>
	);
};