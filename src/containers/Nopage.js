import { Button, Result } from 'antd'
import React from 'react'
import { useHistory} from 'react-router-dom'

const Nopage = () => {
// const param = useRouteMatch()
const history = useHistory()
// console.log("param",param)
    return (
        <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={<Button type="primary" onClick={()=>history.push({pathname:`/home`})} >Back Home</Button>}
      />
    )
}

export default Nopage
