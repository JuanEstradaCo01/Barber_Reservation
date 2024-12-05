import "./recoveryView.css"
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"
import MiniLoader from "../miniLoader/MiniLoader";

function RecoveryView() {

    const [email, setEmail] = useState("")
    const [miniLoader, setMiniLoader] = useState(false)

    const navigate = useNavigate();

    const MySwal = withReactComponent(Swal)

    const notifySuccess = (message) => {
        MySwal.fire({
            show: true,
            title: `${message}`,
            icon: "success",
            showConfirmButton: true
        })
    }

    const sendRecovery = async (evt) => {
        evt.preventDefault()

        document.getElementById("formRecovery").reset()

        setMiniLoader(true)

        await fetch(`${process.env.REACT_APP_URL_BACK}/restablecimientodecontrasena`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email })
        })
            .then(res => res.json()
                .then(data => {
                    setMiniLoader(false)
                    if (res.status === 200) {
                        notifySuccess(data.message)
                        navigate("/")
                    } else if (res.status === 500 || 401 || 404) {
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
        <body id="body-recovery">
            <div id="container">
                <h1>Recuperar contraseña</h1>

                <hr />
                <br />

                <form id="formRecovery">
                    <input onChange={(e) => { setEmail(e.target.value) }} className="inputRecovery" type="text" placeholder="Ingresa tu correo electrónico" />

                    {miniLoader === true ? <button className="btnEnviarRecovery" type="submit"><MiniLoader /></button> : <button onClick={sendRecovery} className="btnEnviarRecovery" type="submit">Enviar</button>}
                </form>
            </div>
        </body>
    )
}

export default RecoveryView;