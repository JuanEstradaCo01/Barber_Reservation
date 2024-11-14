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

    function consultarUsuario() {
        fetch(`${process.env.REACT_APP_URL_BACK}/usuario/${uid}`, {
            credentials: 'include'
        })
            .then(res => res.json()
                .then(data => {
                    if (res.status === 200) {
                        setUser(data.body)
                    } else if (res.status === 401 || res.status === 500) {
                        navigate("/")
                        addId("")
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

    function cancelarTurno() {
        Swal.fire({
            title: "¿Deseas cancelar tu turno?",
            text: "Esta accion es irreversible y tendras que agendar nuevamente",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Confirmar",
            cancelButtonColor: "#d33",
            cancelButtonText: "Cancelar",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.REACT_APP_URL_BACK}/cancelarturno/${uid}`, {
                    method: "DELETE",
                    credentials: "include"
                })
                    .then(res => res.json()
                        .then(data => {
                            if (res.status === 200) {
                                MySwal.fire({
                                    show: true,
                                    title: `<strong>${data.message}</strong>`,
                                    icon: "success",
                                    showConfirmButton: true
                                })
                                consultarUsuario()
                            } else if (res.status === 500 || 404) {
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
        });
    }

    useEffect(() => {
        consultarUsuario()
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
                <Link to={`/reservar/${user.id}`}><Button variant="primary">Reservar turno</Button>{' '}</Link>
            </div>}

            <br />
            <br />
            <hr />

            <h2>Proximo turno:</h2>

            {user.Booking === null ? <h3>¡No tienes turno reservado!</h3> : <div><h4>Turno reservado para el {user.Booking.date} a las {user.Booking.time} horas.</h4>
                <div className="contenedorUsuarioReserva">
                    <Link to={`/reagendarturno/${user.id}`}><Button variant="success">Reagendar turno</Button>{' '}</Link>
                    <Button onClick={cancelarTurno} variant="danger">Cancelar turno</Button>{' '}</div></div>}
        </body>
    )
}

export default UserProfile;