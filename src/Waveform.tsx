import { useEffect, useRef } from "react";

type Props = {
    color: string;
    width: number;
    height: number;
    buffer: AudioBuffer | undefined;
};

const Waveform = (props: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        
        if(props.buffer === undefined || !ctx) return;
        
        const {width, height, color} = props;
        if (color) {
            ctx.fillStyle = color;
        }

        let data = props.buffer.getChannelData( 0 );
        let step = Math.ceil( data.length / width );
        let amp = height / 2;
        for(var i=0; i < width; i++){
            var min = 1.0;
            var max = -1.0;
            for (var j=0; j<step; j++) {
                var datum = data[(i*step)+j];
                if (datum < min)
                    min = datum;
                if (datum > max)
                    max = datum;
            }
        ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
        }
    }, [props])
    
    return (
        <canvas ref={canvasRef} {...props}/>
    );
  }
  
export default Waveform;