export const LoadingPage = ({ noOfDivs }) => {
    const list = [];
    for (var i = 0; i < noOfDivs; i++){
        list.push(<div className='bg-white my-4'>
                    <div className='p-4'>
                        <div style={{ backgroundColor: 'rgb(241, 241, 241)', height: '0.5rem', margin: '1rem'}}  />
                        <div style={{ backgroundColor: 'rgb(241, 241, 241)', height: '0.5rem', margin: '1rem'}}   />
                        <div style={{ backgroundColor: 'rgb(241, 241, 241)', height: '0.5rem', margin: '1rem'}}   />
                        <div style={{ backgroundColor: 'rgb(241, 241, 241)', height: '0.5rem', margin: '1rem' }} />
                        <div style={{ backgroundColor: 'rgb(241, 241, 241)', height: '0.5rem', margin: '1rem'}}    />
                    </div>
                </div>)
    }
    return (
        <>
        { list}
        </>
    );
}
