import { Link } from "react-router-dom";
import "./mainView.css"
import React, { useState } from "react";
import MiniLoader from "../miniLoader/MiniLoader"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"

function MainView() {

    const [user, setUser] = useState("")
    const [password, setPassword] = useState("")

    const [loaderMini, setLoaderMini] = useState(false)

    const MySwal = withReactComponent(Swal)
    const navigate = useNavigate();

    const ingresar = async (evt) => {
        evt.preventDefault()

        const data = ({
            user: user,
            password: password
        })

        document.getElementById("formIngresar").reset()

        setLoaderMini(true)

        await fetch(`/signIn`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then(res => res.json()
                .then(data => {
                    setLoaderMini(false)

                    if (res.status === 200) {
                        navigate(`/usuario/${data.uid}`)
                    } else if (res.status === 404 || 401) {
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
        <body id="bodyMainView">
            <div class="login-container">
                <h2>Iniciar Sesión</h2>

                <hr />
                <br />

                <form id="formIngresar">
                    <label for="username">Usuario</label>
                    <input onChange={(e) => { setUser(e.target.value) }} type="text" id="username" placeholder="Correo electrónico" autoFocus />

                    <label for="password">Contraseña</label>
                    <input onChange={(e) => { setPassword(e.target.value) }} type="password" id="password" placeholder="Contraseña" />

                    {loaderMini === false ? <button onClick={ingresar} type="submit" class="login-button">Ingresar</button> : <button type="submit" class="login-button"><MiniLoader /></button>}
                </form>

                <div className="containerLinksMainView">
                    <Link to={"/recovery"}>¿Olvidaste tu contraseña?</Link>
                    <Link to={"/registro"}>¿No tienes una cuenta?</Link>
                </div>
            </div>
        </body>
    )
}

export default MainView;