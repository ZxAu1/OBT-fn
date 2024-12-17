"use client"
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import './home.scss'
interface SensorData {
  id: number;
  distance: number;
}

interface NoTriggerData {
  type: 'notrigger';
  data: SensorData[];
}

interface TriggerData {
  type: 'trigger';
  condition: number;
  foundIDs: string;
  notFoundIDs: string;
}

const Home = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [triggerData, setTriggerData] = useState<TriggerData | null>(null);

  useEffect(() => {
    // เชื่อมต่อกับ WebSocket server
    const socket = io('http://191.20.207.115:4321');

    socket.on('flowUpdate', (data: NoTriggerData | TriggerData) => {
      console.log(data);

      if (data.type === 'notrigger') {
        console.log('Received sensor data:', data.data);
        setSensorData(data.data);
        setTriggerData(null); // Clear trigger data when receiving 'notrigger'
      } else if (data.type === 'trigger') {
        console.log('Received trigger data:', data);
        setTriggerData(data);
        setSensorData([]); // Clear sensor data when receiving 'trigger'
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Component สำหรับแสดงข้อมูล notrigger
  const NoTriggerComponent = () => {
    // สร้าง array ของ sensor cards 8 ใบ
    const cardIds = Array.from({ length: 12 }, (_, index) => index + 1);

    return (
      <>
           <p  className="h2-cus">NO Trigger</p>

      <div className="sensor-cards">
        {cardIds.map((id) => {
          // ตรวจสอบว่า sensor id ตรงกับที่ได้รับมาหรือไม่
          const sensor = sensorData.find((sensor) => sensor.id === id);
          const isOnline = sensor !== undefined;

          return (
            <div
              key={id}
              className="card"
              // className={`card ${isOnline ? 'online' : 'offline'}`} // ใช้ class 'offline' ถ้าออฟไลน
            >
              <div className={`box ${isOnline ? 'online' : 'offline'}`}>
          
              </div>
              <div className="mg">
              <h3>Sensor {id}</h3>
              {isOnline ? (
                <p>{sensor?.distance.toFixed(0)} </p>
              ) : (
                <p>Offline</p>
              )}
                </div>
                <div className={`status ${isOnline ? 'status-online' : 'status-offline'}`}>
          
          </div>
            </div>
          );
        })}
      </div>
      </>
    );
  };

  // Component สำหรับแสดงข้อมูล trigger
// Component สำหรับแสดงข้อมูล trigger
const TriggerComponent = () => {
  const foundIDs = triggerData?.foundIDs.split(',').map(id => id.trim()) || [];
  const notFoundIDs = triggerData?.notFoundIDs.split(',').map(id => id.trim()) || [];

  // รวม foundIDs และ notFoundIDs ไว้ใน Array เดียว
  const allIDs = [...foundIDs, ...notFoundIDs];

  return (
    <div>
      <p className="h2-cus">Trigger Data</p>
      <div className="des">
      <p>Condition: {triggerData?.condition}</p>
      <p>Found IDs: {triggerData?.foundIDs}</p>
      <p>Not Found IDs: {triggerData?.notFoundIDs}</p>
      </div>
   

      <div className="sensor-cards">
        {allIDs.map((id, index) => {
          const isFound = foundIDs.includes(id);

          return (
            <div
              key={index}
              className="card"
            >
              <div className={`box ${isFound ? 'online' : 'offline'}`}>
              </div>
              <div className="mg">
                <h3>Sensor {id}</h3>
                <p>{isFound ? 'Found' : 'Not Found'}</p>
              </div>
              <div className={`status ${isFound ? 'status-online' : 'status-offline'}`}>
              </div>
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

      {/* แสดงข้อมูลประเภท notrigger หรือ trigger */}
      {sensorData.length > 0 ? <NoTriggerComponent /> : null}
      {triggerData ? <TriggerComponent /> : null}
    </div>
  );
};

export default Home;
