import React, { useState, useEffect } from "react";

const DiscordAuthComponent = () => {
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkIfLogged();
    }, []);

    const checkIfLogged = () => {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            fetchUser(accessToken);
        } else {
            setIsLogged(false);
        }
    };

    const fetchUser = async (accessToken) => { 
        const res = await fetch("https://discord.com/api/users/@me", {
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        if (res.ok) {
            const user = await res.json();
            setUser(user);
            setIsLogged(true);
        } else {
            setIsLogged(false);
        }
    }

    const handleLogin = () => {
        const clientID = "1006520438865801296";
        const redirectURI = "http://localhost:4321";
        const scope = "identify";
        const responseType = "token";
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=${responseType}&scope=${scope}`;
    };

    return (
        <div>
            {isLogged ? (
                <div className="entry">
                    <a href="/br/dashboard" id="login-button">
                        <img
                            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                            style={{
                                fontSize: "0px",
                                lineHeight: "0px",
                                width: "40px",
                                height: "40px",
                                position: "absolute",
                                top: "3px",
                                borderRadius: "100%",
                            }}
                            alt="User Avatar"
                        />
                        <div style={{ fontSize: "0px", lineHeight: "0px", width: "40px", visibility: "hidden", height: "0px", display: "inline-block" }}></div>
                        <span style={{ paddingLeft: "4px" }}>
                            {user.username}
                        </span>
                    </a>
                </div>
            ) : (
                <div className="entry">
                    <a onClick={handleLogin} id="login-button">
                        <div style={{ fontSize: "0px", lineHeight: "0px", width: "40px", visibility: "hidden", height: "0px", display: "inline-block" }}></div>
                        <span style={{ paddingLeft: "4px" }}>
                            Entrar
                        </span>
                    </a>
                </div>
            )}
        </div>
    );
}

export default DiscordAuthComponent;
