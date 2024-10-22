import "./reserve.css"
import React, { useContext, useState } from "react";
import { userContext } from "../context/Context"
import MiniLoader from "../miniLoader/MiniLoader"
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"
import { useNavigate } from "react-router-dom";

function Reserve() {

    const { userId } = useContext(userContext);

    const [am, setAm] = useState(false)
    const [pm, setPm] = useState(false)
    const [loaderMini, setLoaderMini] = useState(false)

    //Inputs
    const [date, setDate] = useState("")
    const [typeTime, setTypeTime] = useState("")
    const [time, setTime] = useState("")

    const navigate = useNavigate()

    const MySwal = withReactComponent(Swal)
    const notifySuccess = (message) => {
        MySwal.fire({
            show: true,
            title: `${message}`,
            icon: "success",
            showConfirmButton: true
        })
    }

    function changeTimeAm() {
        setAm(true)
        setPm(false)
    }

    function changeTimePm() {
        setPm(true)
        setAm(false)
    }

    const reserve = async (evt) => {
        evt.preventDefault()

        document.getElementById("formReservar").reset()

        const body = {
            date,
            typeTime,
            time
        }

        setLoaderMini(true)

        await fetch(`${process.env.REACT_APP_URL_BACK}/reservarturno/${userId}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(data => {
                setLoaderMini(false)
                if (data.code === 201) {
                    notifySuccess(data.message)
                    navigate(`/usuario/${userId}`)
                } else if (data.code === 500 || 404 || 401) {
                    MySwal.fire({
                        show: true,
                        title: `<strong>${data.message}</strong>`,
                        icon: "error",
                        showConfirmButton: true
                    })
                }
            })
            .catch((e) => {
                console.log(e)
            })
    }

    return (
        <body id="bodyReservar">
            <form id="formReservar">
                <h2>Agenda tu reserva</h2>
                <hr />

                <h6>Horario de servicio 08:00AM - 09:00PM</h6>

                <input onChange={(e) => { setDate(e.target.value) }} type="date" />

                <select onChange={(e) => { setTypeTime(e.target.value) }} name="tipoDeHora" id="typeTime">
                    <option value="" disabled selected>Selecciona el horario</option>
                    <option onClick={changeTimeAm} value="AM">AM</option>
                    <option onClick={changeTimePm} value="PM">PM</option>
                </select>
                
                {am === true ? <select onChange={(e) => { setTime(e.target.value) }} name="time" id="time">
                    <option value="" disabled selected>Selecciona la hora del turno</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="08:30">08:30 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                </select> : <></>}

                {pm === true ? <select onChange={(e) => { setTime(e.target.value) }} name="time" id="time">
                    <option value="" disabled selected>Selecciona la hora del turno</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="01:00">01:00 PM</option>
                    <option value="01:30">01:30 PM</option>
                    <option value="02:00">02:00 PM</option>
                    <option value="02:30">02:30 PM</option>
                    <option value="03:00">03:00 PM</option>
                    <option value="03:30">03:30 PM</option>
                    <option value="04:00">04:00 PM</option>
                    <option value="04:30">04:30 PM</option>
                    <option value="05:00">05:00 PM</option>
                    <option value="05:30">05:30 PM</option>
                    <option value="06:00">06:00 PM</option>
                    <option value="06:30">06:30 PM</option>
                    <option value="07:00">07:00 PM</option>
                    <option value="07:30">07:30 PM</option>
                    <option value="08:00">08:00 PM</option>
                    <option value="08:30">08:30 PM</option>
                </select> : <></>}

                {loaderMini === false ? <button onClick={reserve} type="submit">Reservar</button> : <button type="submit"><MiniLoader /></button>}
            </form>
        </body>
    )
}

export default Reserve;