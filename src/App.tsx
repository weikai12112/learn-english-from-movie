import './App.css';
import video from "./assets/video.mp4";
import subtitleJson from './assets/subtitle.json';
import { useEffect, useRef, useState } from 'react';
import { sendTranslateRequest } from '@/apis';

interface Data {
  matches: (timestamp: number) => boolean;
  words: {
    heightLine: (timestamp: number) => boolean;
    text: string;
  }[];
  translate?: string;
}
function App() {
  /** 绝对时间戳 */
  const videoRef = useRef<HTMLVideoElement>(null);
  const [subtitle, setSubtitle] = useState<Data>();
  const [data, setData] = useState<Data[]>();
  const [timestamp, setTimestamp] = useState(0);
  const [currentLang, setCurrentLang] = useState('zh');
  const [originLang, setOriginLang] = useState('en');


  const formatData = () => {
    const d = subtitleJson.utterances.map((utterances) => ({
      matches: (timestamp: number) => {
        if (timestamp > utterances.start_time && timestamp < utterances.end_time) {
          return true
        }
        return false;
      },
      words: utterances.words.map(word => ({
        heightLine: (timestamp: number) => {
          if (timestamp > word.start_time && timestamp < word.end_time) {
            return true
          }
          return false;
        },
        text: word.text
      })),
      translate: utterances.translate
    }))
    return d
  }

  useEffect(() => {
    const data = formatData();
    console.log(data.length);

    setData(data)
  }, [])

  const translate = (text: string) => {
    sendTranslateRequest(text, originLang, currentLang)
  }

  return (
    <div className='container'>
      <video ref={videoRef} className='video' src={video} controls
        onTimeUpdate={() => {
          const video = videoRef.current
          if (video && video?.currentTime && data) {
            setTimestamp(video.currentTime * 1000)
            data.forEach((item) => {
              if (item.matches(video.currentTime * 1000)) {
                setSubtitle(item)
              }
            })
          }
        }}></video>
      <div className='subtitle'>
        <div className='originLang'>{subtitle?.words?.map?.((item) => {
          return <div className={`word ${item.heightLine(timestamp) ? 'heightLine' : ""}`} onClick={() => translate(item.text)}>{item.text}</div>
        })}</div>
        <div className='translate'>{subtitle?.translate}</div>
      </div>
    </div>
  )
}

export default App
