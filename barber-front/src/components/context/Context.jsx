import React, { createContext, useState } from "react";
import Loader from "../loader/Loader";

export const userContext = createContext("");
const Proveedor = userContext.Provider;

export function Userprovider(props) {
    const [userId, setUserId] = useState("");
    const [userInContext, setUserInContext] = useState("");
    const [loader, setLoader] = useState(false)

    function addId(id) {
        setUserId(id)
    };

    function addUser(data) {
        setUserInContext(data)
    };

    async function logOut() {
        setLoader(true)

        await fetch(`${process.env.REACT_APP_URL_BACK}/logout`, {
            method: "POST",
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setLoader(false)
                if (data.code === 200) {
                    setUserInContext("")
                    setUserId("")
                }
            })
            .catch((e) => {
                console.log(e)
            })
    }

    return (
        <Proveedor value={ { userId, userInContext, addId, addUser, logOut } }>
            {props.children}
        </Proveedor>
    )
}