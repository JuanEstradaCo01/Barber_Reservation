import "./recoveryView.css"

function RecoveryView() {
    return (
        <body id="body-recovery">
            <div id="container">
                <h1>Recuperar contraseña</h1>
              
                <hr />
                <br />
    
                <form>
                    <input className="inputRecovery" type="text" placeholder="Ingresa tu correo electrónico" />
                        <button className="btnEnviarRecovery" type="submit">Enviar</button>
                </form>
            </div>
        </body>
    )
}

export default RecoveryView;