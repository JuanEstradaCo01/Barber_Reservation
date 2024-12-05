import "./recoveryView.css"
import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"
import MiniLoader from "../miniLoader/MiniLoader"

function RecoveryPassword() {

    const { uid } = useParams()

    const [newPass, setNewPass] = useState("")
    const [confirmNewPass, setConfirmNewPass] = useState("")
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

    const recoverPass = async (evt) => {
        evt.preventDefault()

        document.getElementById("formRecoveryPassword").reset()

        setMiniLoader(true)

        await fetch(`${process.env.REACT_APP_URL_BACK}/restablecer/${uid}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newPass: newPass,
                confirmNewPass: confirmNewPass
            })
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
                <h1>Restablecer contraseña</h1>

                <hr />
                <br />

                <form id="formRecoveryPassword">
                    <input onChange={(e) => { setNewPass(e.target.value) }} className="inputRecovery" type="password" placeholder="Nueva contraseña" />

                    <input onChange={(e) => { setConfirmNewPass(e.target.value) }} className="inputRecovery" type="password" placeholder="Confirmar contraseña" />

                    {miniLoader === true ? <button className="btnEnviarRecovery" type="submit"><MiniLoader /></button> : <button onClick={recoverPass} className="btnEnviarRecovery" type="submit">Enviar</button>}
                </form>
            </div>
        </body>
    )
}

export default RecoveryPassword;