
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { AiFillCamera } from "react-icons/ai";
import Tweet from "./Tweet";
import jwtDecode from "jwt-decode";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

function ProfileBody() {
  const [loading, setLoading] = useState(true);
  const [tweets, setTweets] = useState([]);
  const [activeUser, setActiveUser] = useState("");
  const [followers, setFollowers] = useState("");
  const [followBtn, setFollowBtn] = useState("");
  const [avatar, setAvatar] = useState("initial-avatar.png");
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [img, setImg] = useState();
  const navigate = useNavigate();
  const { userName } = useParams();
  const isActiveUser = activeUser === userName;

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchData() {
      try {
        if (!token) {
          navigate("/");
          return;
        }

        const user = jwtDecode(token);

        if (!user) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        const response = await fetch(`http://localhost:5000/profile/${userName}`, {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        });

        const data = await response.json();

        if (data.status === "ok") {
          setActiveUser(data.activeUser);
          setTweets(data.tweets);
          setFollowers(data.followers);
          setFollowBtn(data.followBtn);
          setAvatar(data.avatar);
        } else {
          alert(data.error);
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [userName, navigate]);

  const onImageChange = (e) => {
    const [file] = e.target.files;
    setImg(URL.createObjectURL(file));
    setIsImageSelected(true);
  };

  const handleFollow = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/user/${activeUser}/follow/${userName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      setFollowers(data.followers);
      setFollowBtn(data.followBtn);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitAvatar = (e) => {
    axios
      .post(`http://localhost:5000/avatar/${activeUser}`, {
        avatar: `Avatar-${e.target.id}.png`,
      })
      .then((response) => {
        if (response.data.status === "ok") {
          setAvatar(response.data.avatar);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="container">
      <div className="flex-avatar">
        <img className="profile-avatar" src={`http://localhost:5000/images/${avatar}`} alt={`${userName}'s Avatar`} />
        {isActiveUser && (
          <Popup position="center" modal trigger={<button className="tweetBtn">Choose avatar</button>}>
            {(close) => (
              <div className="choose-avatar-container">
                {/* Mapping through avatars */}
                {Array.from({ length: 15 }).map((_, index) => (
                  <img
                    key={index}
                    onClick={(e) => {
                      close();
                      handleSubmitAvatar(e);
                    }}
                    id={index + 1}
                    className="choose-profile-avatar"
                    src={`http://localhost:5000/images/Avatar-${index + 1}.png`}
                    alt={`Avatar-${index + 1}`}
                  />
                ))}
              </div>
            )}
          </Popup>
        )}
      </div>
      <div className="userName">{userName}</div>

      <div className="followFollowing">
        <div>
          <b>{followers}</b> Followers
        </div>
        {/* Add Following count if available */}
      </div>
      {!isActiveUser && (
        <div className="followBtn-div">
          <form
            action={`http://localhost:5000/user/${activeUser}/follow/${userName}`}
            method="POST"
            className="follow-form"
            onSubmit={handleFollow}
          >
            <button className="followBtn" type="submit">
              {followBtn}
            </button>
          </form>
        </div>
      )}
      <div className="userTweets">
        <div className="userTweets-heading">Tweets</div>
        <div className="tweets">
          <ul className="tweet-list">
            {loading ? (
              <div
                style={{ marginTop: "50px", marginLeft: "250px" }}
                className="loadingio-spinner-rolling-uzhdebhewyj"
              >
                <div className="ldio-gkgg43sozzi">
                  <div></div>
                </div>
              </div>
            ) : (
              tweets.map(function (tweet) {
                return <Tweet key={tweet.id} user={activeUser} body={tweet} />;
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProfileBody;
