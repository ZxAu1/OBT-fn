"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./home.scss";

interface SensorData {
  id: number;
  distance: number | null;
}

interface TriggerData {
  type: "trigger";
  condition: number;
  foundBoards: SensorData[];
  notFoundBoards: SensorData[];
}

const Home = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [triggerData, setTriggerData] = useState<TriggerData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleLogin = () => {
    if (inputValue === "123") {
      setIsAuthorized(true);
    } else {
      alert("ไม่ผ่าน ไม่สามารถเข้าใช้งานได้");
    }
  };

  useEffect(() => {
    const socket = io("http://191.20.207.115:81");
  
    socket.on("connect", () => {
      console.log("Socket.IO connected.");
    });
  
    socket.on("sensor_data", (data) => {
      if (data.type === "trigger") {
        setTriggerData({
          type: "trigger",
          condition: data.condition,
          foundBoards: Array.isArray(data.foundIDs)
            ? data.foundIDs.map((board: { id: any; distance: any; }) => ({
                id: board.id,
                distance: board.distance,
              }))
            : [],
          notFoundBoards: Array.isArray(data.notFoundIDs)
            ? data.notFoundIDs.map((board: { id: any; distance: any; }) => ({
                id: board.id,
                distance: board.distance,
              }))
            : [],
        });
        setSensorData([]);
      } else if (data.type === "nottrigger") {
        setSensorData(
          Array.isArray(data.data)
            ? data.data.map((board: { id: any; distance: any; }) => ({
                id: board.id,
                distance: board.distance,
              }))
            : []
        );
        setTriggerData(null);
      }
    });
    
  
    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected.");
    });
  
    return () => {
      socket.disconnect();
    };
  }, []);
  
  
  
  

  const NoTriggerComponent = () => {
    const cardIds = Array.from({ length: 12 }, (_, index) => index + 1);

    return (
      <div>
        <p className="h2-cus">NO TRIGGER</p>
        <div className="sensor-cards">
          {cardIds.map((id) => {
            const sensor = sensorData.find((sensor) => sensor.id === id);
            const isOnline = sensor !== undefined;

            return (
              <div key={id} className="card">
                <div className={`box ${isOnline ? "online" : "offline"}`}></div>
                <div className="mg">
                  <h3>BOARD {id}</h3>
                  {isOnline ? (
                    <p>{sensor?.distance?.toFixed(0)}</p>
                  ) : (
                    <p>Offline</p>
                  )}
                </div>
                <div
                  className={`status ${
                    isOnline ? "status-online" : "status-offline"
                  }`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const TriggerComponent = () => {
    const foundBoards = triggerData?.foundBoards || [];
    const notFoundBoards = triggerData?.notFoundBoards || [];
    const allBoards = [...foundBoards, ...notFoundBoards];
  
    return (
      <div>
        <p className="h2-cus">TRIGGER DATA</p>
        <div className="des">
          <p>
            Condition: <span>{triggerData?.condition}</span>
          </p>
          <p>
            Found Boards:{" "}
            <span>
              {foundBoards
                .map((board) => `id:${board.id},distance:${board.distance}`)
                .join(", ")}
            </span>
          </p>
          <p>
            Not Found Boards:{" "}
            <span>
              {notFoundBoards.map((board) => `id:${board.id}`).join(", ")}
            </span>
          </p>
        </div>
        <div className="sensor-cards">
          {allBoards.map((board, index) => {
            const isFound = foundBoards.some((item) => item.id === board.id);
  
            return (
              <div key={index} className="card">
                <div className={`box ${isFound ? "online" : "offline"}`}></div>
                <div className="mg">
                  <h3>BOARD {board.id}</h3>
                  <p>{isFound ? `Distance: ${board.distance}` : "Not Found"}</p>
                </div>
                <div
                  className={`status ${
                    isFound ? "status-online" : "status-offline"
                  }`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  

  return (
    <div>
      <p className="h1-cus">OBSTRON</p>
      {sensorData.length > 0 && <NoTriggerComponent />}
      {triggerData && <TriggerComponent />}
    </div>
  );
};

export default Home;
