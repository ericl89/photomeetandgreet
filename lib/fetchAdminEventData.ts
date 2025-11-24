import axios from 'axios';

export async function fetchAdminEventData(options: {
    pageIndex: number | 0,
    pageSize: number
    when: string | 'upcoming'
}) {


    return axios.get('/api/admin/events?page=' + options.pageIndex + '&pageSize=' + options.pageSize + '&when='+ options.when)
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