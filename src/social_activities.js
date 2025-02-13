import React, { Component } from 'react'
import { Row, Col, Card, Badge } from 'react-bootstrap'
import { Container } from 'reactstrap'

function LiAnchorItem(props) {
  return (
    <li className='list-inline-item'>[<a href={props.link.url} target='_blank' rel='noopener noreferrer'>{props.link.type}</a>]</li>
  )
}

class Social_Activity extends Component {
  render() {
    const { data } = this.props
    return (
      <Col  md={{span:3, offset:3}} className='d-flex flex-row align-items-stretch'>
        <Card className='mb-3 shadow-sm h-md-250' style={{width:"40rem"}}>
          <Card.Header>{data.title}</Card.Header>
          <Card.Img variant='top' src={data.img} />
          <Card.Body className='d-flex flex-column align-items-start'>
            <Card.Text className='mb-auto'>{data.description}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    )
  }
}

class Social_Activities extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: props.data
    }
  }

  render() {
    if (this.props.data) {
      const { data } = this.props
      const cards = []
      for (let i = 0; i < data.length; i++) {
        cards.push(<Social_Activity data={data[i]} key={i} />)
        if (i % 2 === 1) {
          cards.push(<div key={'w-' + i} className='w-100' />)
        }
      }
      return (
        <Row>
          {cards}
        </Row>
      )
    } else {
      return <Row />
    }
  }
}
export default Social_Activities
