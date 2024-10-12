import React, { useContext, useState, useEffect } from "react";
import "./userProfile.css"
import { userContext } from '../context/Context';
import { useParams, useNavigate, Link } from "react-router-dom"
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"
import Loader from "../loader/Loader";
import AdminView from "../adminView/AdminView";
import Button from 'react-bootstrap/Button';

function UserProfile() {

    const { uid } = useParams()
    const MySwal = withReactComponent(Swal)

    const { addId, logOut } = useContext(userContext);

    addId(uid)

    const [user, setUser] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        fetch(`${process.env.REACT_APP_URL_BACK}/usuario/${uid}`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.code === 200 || 404) {
                    setUser(data.body)
                } else if (data.code === 401 || 500) {
                    navigate("/")
                    addId("")
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
    }, [])

    if (user === "") {
        return <Loader />
    }

    if (user.role === "Admin") {
        return <AdminView admin={user} />
    }

    return (
        <body id="containerProfile">
            <div className="divBtnSalir"><Link to={"/"}><Button onClick={logOut} variant="outline-danger">Cerrar sesion</Button>{' '}</Link></div>

            <h2>¡Hola, {user.names}!</h2>

            {user.Booking !== null ? <></> : <div className="btnReservarContenedor">
                <Link to={"/reservar"}><Button variant="primary">Reservar turno</Button>{' '}</Link>
            </div>}

            <br />
            <br />
            <hr />

            <h2>Proximo turno:</h2>

            {user.Booking === null ? <h3>¡No tienes turno reservado!</h3> : <div><h4>Turno reservado para el {user.Booking.date} a las {user.Booking.time} {user.Booking.typeTime}</h4>
            <div className="contenedorUsuarioReserva">
            <Link to={"/reagendarturno"}><Button variant="success">Reagendar turno</Button>{' '}</Link>
            <Button variant="danger">Cancelar turno</Button>{' '}</div></div>}
        </body>
    )
}

export default UserProfile;