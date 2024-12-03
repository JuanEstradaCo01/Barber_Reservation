import "./nav.css"
import Logo from "../imgs/logo.png"
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import React, { useContext } from 'react';
import { userContext } from '../context/Context';
import { FaUserCircle } from "react-icons/fa";

function Header() {

    const { userId } = useContext(userContext)

    return (
        <>
            {userId === "" ? <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Link to={"/"}><img className="imgLogo" src={Logo} alt="Logo" /></Link>
                    <Navbar.Brand><span className="spanNavBar">Maxi Barber Shop</span></Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <div className="containerBtnsNav">
                            <Link to={"/"}><Button variant="outline-dark">Iniciar sesion</Button></Link>
                            <Link to={"/registro"}><Button variant="primary">Regístrate</Button>{' '}</Link>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar> : <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Link to={`/usuario/${userId}`}><img className="imgLogo" src={Logo} alt="Logo" /></Link>
                    <Navbar.Brand><span className="spanNavBar">Maxi Barber Shop</span></Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <div className="containerBtnsNav">
                            <Link to={`/usuario/${userId}`}><FaUserCircle /></Link>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>}
        </>
    );
}

export default Header;