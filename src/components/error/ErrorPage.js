import { withRouter } from 'react-router-dom'
const ErrorPage = ({ location }) => {
    const defaultError = {
        error: {
            statusCode: 500,
            message: "Internal Server error",
            details: ["Error in processing"]
        }
    };
    
    const error = location.state || defaultError;
    console.log(error);
    return (
      <>
        <div className='mw-100'>
            <div className="m-3 border-bottom row">
                <h2>HTTP ERROR {error.statusCode}</h2>
            </div>
            <div className='m-4 row'>
                <span>{error.message}</span>
            </div>
                {error.details &&
                    <div className='m-4 row'>
                        <ul>
                            {error.details.map((detail, index) => {
                                return <li key={index}>{detail}</li>

                            })}
                        </ul>
                    </div>
                }
        </div>
      </>
    );
}

export default withRouter(ErrorPage)