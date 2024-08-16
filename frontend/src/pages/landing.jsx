import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function LandingPage() {

    const router = useNavigate();




    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>FlashMeet</h2>
                </div>

                <div className="navList">

                    <p onClick={() => {
                        router("/join-as-guest")
                    }}>Join as Guest</p>

                    <p onClick={() => {
                        router("/auth")

                    }}>Register</p>

                    <div onClick={() => {
                        router("/auth")

                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>


            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color:"#FF9839"}}>Connect</span> with your Loved Ones</h1>
                    <p>Cover a distance by FlashMeet</p>
                    <div role="button">
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" alt=""  />
                </div>
            </div>







        </div>
    )
}