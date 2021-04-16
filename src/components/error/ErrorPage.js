import { withRouter } from 'react-router-dom'
const ErrorPage = ({ location }) => {
    const defaultError = {
        error: {
            statusCode: 500,
            message: "Internal Server error",
            details: ["Error in processing"]
        }
    };
    console.log(location.state)
    const { error } = location.state || defaultError;
    return (
      <>
        <div className='mw-100'>
            <div className="m-3 border-bottom row">
                HTTP ERROR {error.statusCode}
            </div>
            <div className='m-4 row'>
                <span>{error.message}</span>
            </div>
                <div className='m-4 row'>
                    <ul>
                        {error.details.map((detail) => {
                            return <li>{detail}</li>

                        })}
                    </ul>
            </div>      
        </div>
      </>
    );
}

export default withRouter(ErrorPage)