import React from 'react'
// import Jumbotron from 'react-bootstrap/Jumbotron'; 
import { Row, Col} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLinkedinIn,
  faGithub,
  faGoogle,
  faGoogleScholar,
  faOrcid
} from '@fortawesome/free-brands-svg-icons'

function About() {
  return (
    <div class="container-fluid bg-light text-dark p-5">
      <div class="container bg-light p-5">
        {/* <h1 class="display-4 fw-bold">Welcome to Admin Dashboard</h1> */}

          <Row id='about' className='justify-content-md-center'>
          <Col md={10} sm={12} className='mt-3'>
            <Row>
              <Col md={4} xs={12}>
                <div style={{ display: 'block' }}>
                  <img className='portrait' src='./Duc_Le.jpg' alt='Duc Le' style={{width: "500", height: "500"}}/>
                  <h3 className='text-center'>Duc Le, Bs</h3>
                  <h4 className='text-center'>AI Researcher @ Computer Science Lab</h4>
                  <ul className='social-links text-center'>
                    {/* <li><a target='_blank' rel='noopener noreferrer' href='https://twitter.com/ZichenWangPhD' title='Twitter'><FontAwesomeIcon icon={faTwitter} /></a></li> */}
                    <li><a target='_blank' rel='noopener noreferrer' href='https://github.com/lengocduc195' title='GitHub'><FontAwesomeIcon icon={faGithub} /></a></li>
                    <li><a target='_blank' rel='noopener noreferrer' href='https://www.linkedin.com/in/lengocduc195/' title='LinkedIn'><FontAwesomeIcon icon={faLinkedinIn} /></a></li>
                    {/* <li><a target='_blank' rel='noopener noreferrer' href='https://wangz10.medium.com/' title='Medium'><FontAwesomeIcon icon={faMediumM} /></a></li> */}
                    <li><a target='_blank' rel='noopener noreferrer' href='https://scholar.google.com/citations?user=s6oA5t8AAAAJ' title='Google Scholar'><FontAwesomeIcon icon={faGoogleScholar} /></a></li>
                    <li><a target='_blank' rel='noopener noreferrer' href='mailto:lengocduc195@gmail.com' title='Email'><FontAwesomeIcon icon={faGoogle} /></a></li>
                    {/* <li><a target='_blank' rel='noopener noreferrer' href='https://www.researchgate.net/profile/Zichen_Wang' title='ResearchGate'><FontAwesomeIcon icon={faResearchgate} /></a></li> */}
                    <li><a target='_blank' rel='noopener noreferrer' href='https://orcid.org/0009-0006-1574-1743' title='ORCID'><FontAwesomeIcon icon={faOrcid} /></a></li>
                  </ul>
                </div>
              </Col>
              <Col md={8} xs={12}>
                <h1>About</h1>
                <p className='lead'>
                I specialize in Explainable AI (XAI) and Causal AI, with a strong focus on Computer Vision. I have experience working with Natural Language Processing (NLP) and Time Series analysis, allowing me to handle a variety of AI-related tasks across different domains. My expertise includes developing and evaluating AI models, particularly in designing algorithms to assess model performance and interpretability.
                </p>
                <p className='lead'>
                I am especially passionate about AI applications in healthcare, where explainability and reliability are crucial. I am always eager to explore innovative solutions that can improve medical diagnostics, patient care, and decision-making processes.
                </p>
                <p className='lead'>
                In addition to my technical skills, I have a strong analytical mindset and attention to detail, ensuring that models are not only accurate but also interpretable and trustworthy. I am continuously learning and seeking opportunities to apply my knowledge to real-world challenges, contributing to the advancement of AI-driven solutions.
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  )
}
export default About
