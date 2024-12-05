import "./registerView.css"
import React, { useState } from "react"
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"
import MiniLoader from "../miniLoader/MiniLoader"
import { useNavigate } from "react-router-dom"

function RegisterView() {

    const [names, setNames] = useState("")
    const [surnames, setSurnames] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loaderMini, setLoaderMini] = useState(false)

    const navigate = useNavigate();

    const MySwal = withReactComponent(Swal)
    const notifySuccess = () => {
        MySwal.fire({
            show: true,
            title: "¡Registro exitoso!",
            icon: "success",
            showConfirmButton: true
        })
    }

    const register = async (evt) => {
        evt.preventDefault()

        document.getElementById("formRegister").reset()

        const user = ({
            names: names,
            surnames: surnames,
            phone: phone,
            email: email,
            password: password
        })

        setLoaderMini(true)

        await fetch(`/registro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user)
        })
            .then(res => res.json()
                .then(data => {
                    setLoaderMini(false)
                    if (res.status === 201) {
                        notifySuccess()
                        navigate("/")
                    } else if (res.status === 500 || 401) {
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
        <body id="bodyRegister">
            <div class="form-container">
                <h2>Registro usuarios</h2>

                <hr />
                <br />

                <form id="formRegister">
                    <label for="names">Nombres</label>
                    <input onChange={(e) => { setNames(e.target.value) }} type="text" id="names" placeholder="Nombres" required autoFocus />

                    <label for="surname">Apellidos</label>
                    <input onChange={(e) => { setSurnames(e.target.value) }} type="text" id="surname" placeholder="Apellidos" required />

                    <label for="phone">Teléfono</label>
                    <input onChange={(e) => { setPhone(e.target.value) }} type="tel" id="phone" placeholder="Número de contacto" required />

                    <label for="email">Correo electrónico</label>
                    <input onChange={(e) => { setEmail(e.target.value) }} type="email" id="email" placeholder="Correo electronico" required />

                    <label for="password">Contraseña</label>
                    <input onChange={(e) => { setPassword(e.target.value) }} type="password" id="password" placeholder="Contraseña" required />

                    {loaderMini === false ? <button onClick={register} type="submit" value="Regístrate">Regístrate</button> : <button type="submit"><MiniLoader /></button>}

                </form>
            </div>
        </body>
    )
}

export default RegisterView;