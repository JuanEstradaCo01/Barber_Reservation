import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"
import MiniLoader from "../miniLoader/MiniLoader"

function ReSchedule() {

    const { uid } = useParams()

    //Inputs
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")

    const [loaderMini, setLoaderMini] = useState(false)

    const [year, month, day] = date.split('-');
    const newFormatDate = `${day}/${month}/${year}`

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

    const reserve = async (evt) => {
        evt.preventDefault()

        document.getElementById("formReservar").reset()

        const body = {
            date: newFormatDate,
            time
        }

        setLoaderMini(true)

        await fetch(`/reagendarturno/${uid}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json()
                .then(data => {
                    setLoaderMini(false)
                    if (res.status === 200) {
                        notifySuccess(data.message)
                        navigate(`/usuario/${uid}`)
                    } else if (res.status === 500 || 404 || 401) {
                        MySwal.fire({
                            show: true,
                            title: `<strong>${data.message}</strong>`,
                            icon: "error",
                            showConfirmButton: true
                        })
                    }
                }))
            .catch((e) => {
                console.log(e)
            })
    }

    return (
        <body id="bodyReservar">
            <form id="formReservar">
                <h2>Reagenda tu reserva</h2>
                <hr />

                <h6>Horario de servicio 08:00AM - 08:30PM</h6>

                <input onChange={(e) => { setDate(e.target.value) }} type="date" />

                <select onChange={(e) => { setTime(e.target.value) }} name="time" id="time">
                    <option value="" selected disabled>Selecciona la hora del turno</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="08:30">08:30 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="16:30">04:30 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="17:30">05:30 PM</option>
                    <option value="18:00">06:00 PM</option>
                    <option value="18:30">06:30 PM</option>
                    <option value="19:00">07:00 PM</option>
                    <option value="19:30">07:30 PM</option>
                    <option value="20:00">08:00 PM</option>
                    <option value="20:30">08:30 PM</option>
                </select>

                {loaderMini === false ? <button onClick={reserve} type="submit">Confirmar</button> : <button type="submit"><MiniLoader /></button>}
            </form>
        </body>
    )
}

export default ReSchedule;