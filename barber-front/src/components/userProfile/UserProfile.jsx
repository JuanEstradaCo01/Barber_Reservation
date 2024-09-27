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

    const { addId, addUser, logOut } = useContext(userContext);

    addId(uid)

    const [user, setUser] = useState("")

    addUser(user)

    const navigate = useNavigate()

    useEffect(() => {
        fetch(`${process.env.REACT_APP_URL_BACK}/user/${uid}`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.code === 200) {
                    setUser(data.body)
                } else if (data.code === 401 || 404 || 500) {
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

            <div className="btnReservarContenedor">
                <Button variant="primary">Reservar turno</Button>{' '}
            </div>

            <br />
            <br />
            <hr />

            <h2>Proximo turno:</h2>

            <h3>¡No tienes turno reservado!</h3>
        </body>
    )
}

export default UserProfile;