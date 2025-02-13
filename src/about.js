import React from 'react'
import { Jumbotron } from "reactstrap"; 
import { Container, Row, Col, ButtonToolbar} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLinkedinIn,
  faTwitter,
  faGithub,
  faMediumM,
  faGoogle,
  faResearchgate,
  faOrcid
} from '@fortawesome/free-brands-svg-icons'

function About() {
  return (
    // <ButtonToolbar fluid id='about'>
      // <Container fluid>
      //   <Row className='justify-content-md-center'>
      //     <Col md={10} sm={12} className='mt-3'>
      //       <Row>
      //         <Col md={4} xs={12}>
      //           <div style={{ display: 'block' }}>
      //             <img className='portrait' src='./assets/Duc_Le.jpg' alt='Duc Le' />
      //             <h3 className='text-center'>Duc Le, Bs</h3>
      //             <h4 className='text-center'>AI Researcher @ Computer Science Lab</h4>
      //             <ul className='social-links text-center'>
      //               <li><a target='_blank' rel='noopener noreferrer' href='https://twitter.com/ZichenWangPhD' title='Twitter'><FontAwesomeIcon icon={faTwitter} /></a></li>
      //               <li><a target='_blank' rel='noopener noreferrer' href='https://github.com/wangz10' title='GitHub'><FontAwesomeIcon icon={faGithub} /></a></li>
      //               <li><a target='_blank' rel='noopener noreferrer' href='https://www.linkedin.com/in/zichenwang/' title='LinkedIn'><FontAwesomeIcon icon={faLinkedinIn} /></a></li>
      //               <li><a target='_blank' rel='noopener noreferrer' href='https://wangz10.medium.com/' title='Medium'><FontAwesomeIcon icon={faMediumM} /></a></li>
      //               <li><a target='_blank' rel='noopener noreferrer' href='https://scholar.google.com/citations?user=bwLMCp4AAAAJ' title='Google Scholar'><FontAwesomeIcon icon={faGoogle} /></a></li>
      //               <li><a target='_blank' rel='noopener noreferrer' href='https://www.researchgate.net/profile/Zichen_Wang' title='ResearchGate'><FontAwesomeIcon icon={faResearchgate} /></a></li>
      //               <li><a target='_blank' rel='noopener noreferrer' href='http://orcid.org/0000-0002-1415-1286' title='ORCID'><FontAwesomeIcon icon={faOrcid} /></a></li>
      //             </ul>
      //           </div>
      //         </Col>
      //         <Col md={8} xs={12}>
      //           <h1>About</h1>
      //           <p className='lead'>
      //             I am a senior applied scientist at {' '}
      //             <a href='https://aws.amazon.com/' target='_blank' rel='noopener noreferrer'>
      //               AWS
      //             </a> AI Research and Education (AIRE). I am interested in various research areas in ML, including graph neural networks (GNN), natural language processing (NLP), generative modeling, and their applications in biology and chemistry.
      //             I have over 10 years of experience in life sciences and healthcare. In the past, I worked on developing ML methods leveraging biomedical data including biological sequences, multi-omics, and longitudinal electronic health records (EHR), for drug discovery and modeling of human diseases.
      //           </p>
      //           <p className='lead'>
      //             I obtained my PhD in 2016 from <a href='https://icahn.mssm.edu/' target='_blank' rel='noopener noreferrer'> Icahn School of Medicine at Mount Sinai</a> and was advised by <a href='https://icahn.mssm.edu/profiles/avi-maayan' target='_blank' rel='noopener noreferrer'>Avi Ma'ayan</a>, with whom I continued working on multiple research projects on understanding how drugs work in biological systems using computational biology. I developed solid software engineering skills in making interactive data visualizations and web applications.
      //           </p>
      //         </Col>
      //       </Row>
      //     </Col>
      //   </Row>
      // </Container>
    // </ButtonToolbar>
<Container className="my-5">
      <Row className="align-items-center">
        {/* Cột ảnh cá nhân */}
        <Col md={3} className="text-center">
          <Image
            src="https://via.placeholder.com/150" // Thay bằng link ảnh thật của bạn
            roundedCircle
            fluid
          />
        </Col>

        {/* Cột thông tin cá nhân */}
        <Col md={9}>
          <h3 className="fw-bold">Lê Ngọc Đức</h3>
          <h5 className="text-muted">AI QA Engineer | Computer Vision Enthusiast</h5>
          <p>
            I am an AI QA Engineer with expertise in developing and validating AI models, 
            particularly in Vision AI. My research interests include Explainable AI (XAI), 
            AI model evaluation, and real-world AI deployment.
          </p>
          <p>
            I am currently exploring investment opportunities in real estate, startups, and 
            financial markets while enhancing my technical skills in AI and machine learning.
          </p>
          <p>
            My long-term goal is to work on AI applications in healthcare and contribute to the field 
            by ensuring AI models are reliable and interpretable.
          </p>
        </Col>
      </Row>
    </Container>

  )
}
export default About
