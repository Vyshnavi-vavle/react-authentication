import  { useState,useRef, useEffect } from "react";

const OtpInput = ({ length=4, onOtpSubmit=(_otp: string) => {} }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // Focus the first input on mount
    if(inputRefs.current[0]){
        inputRefs.current[0].focus();
    }
  }, []);

  const handleChange =(event,index)=>{
    const value = event.target.value;
    if(isNaN(value) || value.length > 1) return;

    const newOtp = [...otp];

    //allow only 1 input and move to next input
    newOtp[index] = value.substring(value.length-1);
    setOtp(newOtp);

    //submit OTP if all inputs are filled
    const completeOtp = newOtp.join("");
    if(completeOtp.length === length) onOtpSubmit(completeOtp);

    //move to next input if current input is filled
    if(value && index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown =(event,index)=>{
    if(event.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
    }

  }
  const handleClick =(index)=>{
    inputRefs.current[index].setSelectionRange(1,1);
  }

  return (
    <div>
        {
            otp.map((value, index) => (
                <input
                    key={index}
                    ref={(el) => { if(el) inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => {handleChange(e, index)}}
                    onKeyDown={(e) => {handleKeyDown(e, index)}}
                    onClick={() => {handleClick(index)}}
                    style={{width: "40px", height: "40px", textAlign: "center", marginRight: "8px"}}    
                />
            ))}

    </div>
  );
}
export default OtpInput;