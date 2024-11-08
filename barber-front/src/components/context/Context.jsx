import React, { createContext, useState } from "react";

export const userContext = createContext("");
const Proveedor = userContext.Provider;

export function Userprovider(props) {
    const [userId, setUserId] = useState("");

    function addId(id) {
        setUserId(id)
    };

    async function logOut() {
        await fetch(`${process.env.REACT_APP_URL_BACK}/logout`, {
            method: "POST",
            credentials: 'include'
        })
            .then(res => res.json()
                .then(data => {
                    if (res.status === 200) {
                        setUserId("")
                    }
                }))
            .catch((e) => {
                console.log(e)
            })
    }

    return (
        <Proveedor value={{ userId, addId, logOut }}>
            {props.children}
        </Proveedor>
    )
}