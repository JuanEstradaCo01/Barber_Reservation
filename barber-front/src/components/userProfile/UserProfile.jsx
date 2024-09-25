import React, { useContext, useState, useEffect } from "react";
import "./userProfile.css"
import { userContext } from '../context/Context';
import { useParams, useNavigate, Link } from "react-router-dom"
import Swal from "sweetalert2"
import withReactComponent from "sweetalert2-react-content"
import Loader from "../loader/Loader";
import AdminView from "../adminView/AdminView";

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

    if(user.role === "Admin") {
        return <AdminView />
    }

    return (
        <div className="containerProfile">
            <h2>¡Hola, {user.names}!</h2>

            <Link to={"/"}><button onClick={logOut}>Cerrar sesion</button></Link>
            <button>Reservar turno</button>

            <h2>Proximo turno:</h2>
        </div>
    )
}

export default UserProfile;