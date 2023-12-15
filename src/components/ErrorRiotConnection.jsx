const SuccessRiotConnection = () => {
    return (
        <div className="connection-successfully">
            <img className="connection-logo" src="/foxyriot.png"></img>
            <h2 style={{ textAlign: 'center', marginRight: '20%', marginTop: '-5%' }}>
                Sua conta da Riot Games não foi conectada a Foxy
            </h2>
            <h3 style={{ textAlign: 'center', marginRight: '20%', marginTop: '1%' }}>
                Desculpe, mas ocorreu um problema estranho ao conectar sua conta da Riot Games a Foxy. Tente novamente mais tarde.
            </h3>
        </div>
    )
};

export default SuccessRiotConnection;