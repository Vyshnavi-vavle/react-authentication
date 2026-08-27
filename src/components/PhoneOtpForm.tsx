import React, { useState } from "react";
import OtpInput from "./OtpInput";

const PhoneOtpForm = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setPhoneNumber(value);
    if (value.length > 0 && value.length < 10) {
      setError("Phone number must be exactly 10 digits");
    } else {
      setError("");
    }
  };

  const handlePhoneSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phoneNumber.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }
    setError("");

    //send OTP logic here
    //Show OTP field after sending OTP
    setShowOtp(true);
  };

  const onOtpSubmit = (otp: string) => {
    //verify OTP logic here
    console.log("OTP submitted:", otp);
  }

  return (
    <div>
      {!showOtp ? (
        <form onSubmit={handlePhoneSubmit}>
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phoneNumber}
            placeholder="Enter your 10-digit phone number"
            onChange={handlePhoneNumber}
            maxLength={10}
            required
          />
          <button type="submit" disabled={phoneNumber.length !== 10}>Send OTP</button>
        </form>
      ) : (
        <div>
          <p>Enter OTP sent by {phoneNumber}</p>
          <OtpInput length={4} onOtpSubmit={onOtpSubmit}/>
        </div>
      )}
    </div>
  );
};

export default PhoneOtpForm;
