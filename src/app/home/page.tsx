"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.137.3:81/ws");

    socket.onopen = () => {
      console.log("WebSocket connection established");
      socket.send(
        JSON.stringify({
          event: "register",
          id: "clientB",
        })
      );
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log("Received data:", response);

        if (!response.event) {
          console.error("Missing event type in response");
          return;
        }

        switch (response.event) {
          case "welcome":
            console.log("Welcome message:", response.message);
            break;

          case "registered":
            console.log("Registered message:", response.message);
            break;

          case "sensor_data":
            if (response.type === "nottrigger") {
              if (Array.isArray(response.message)) {
                setSensorData(response.message);
                setTriggerData(null);
              }
            } else if (response.type === "trigger" && response.message) {
              const foundBoards = parseSensorData(response.message.foundIDs);
              const notFoundBoards = parseSensorData(response.message.notFoundIDs);
              setTriggerData({
                type: "trigger",
                condition: response.message.condition,
                foundBoards,
                notFoundBoards,
              });
              setSensorData([]);
            }
            break;

          case "error":
            console.error("Server error:", response.message);
            break;

          default:
            console.warn("Unknown event type:", response.event);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  const parseSensorData = (data: string): SensorData[] => {
    return data
      .split(", ")
      .map((item) => {
        const [idPart, distancePart] = item.replace(/[{}]/g, "").split(",");
        const id = parseInt(idPart.split(":")[1]);
        const distance = distancePart ? parseInt(distancePart.split(":")[1]) : null;
        return { id, distance };
      })
      .filter((sensor) => !isNaN(sensor.id));
  };

  const NoTriggerComponent = () => {
    const cardIds = Array.from({ length: 12 }, (_, index) => index + 1);

    return (
      <>
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
                  {isOnline ? <p>{sensor?.distance?.toFixed(0)}</p> : <p>Offline</p>}
                </div>
                <div className={`status ${isOnline ? "status-online" : "status-offline"}`}></div>
              </div>
            );
          })}
        </div>
      </>
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
            <span>{notFoundBoards.map((board) => `id:${board.id}`).join(", ")}</span>
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
                <div className={`status ${isFound ? "status-online" : "status-offline"}`}></div>
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