import axios from 'axios';

export async function fetchData(options: {
    pageIndex: number | 0,
    pageSize: number
}) {


    return axios.get('/api/events?page=' + options.pageIndex + '&pageSize=' + options.pageSize)
        .then(function (response) {
            // handle success

            return {
                rows: response.data.rows,
                pageCount: response.data.pageCount,
                rowCount: response.data.rows.length,
            }
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })


}