import {ControlLabel, FormControl, FormGroup} from "react-bootstrap";
import React, {useState} from "react";

import './ExpandArea.css'

export default function ExpandArea(props) {
  const [expanded, setExpanded] = useState(false)

  function toggleExpandedArea() {
    if (expanded) {
      setExpanded(false)
      return
    }

    setExpanded(true)
  }

  return (
    <div className='ExpandArea'>
      <div className='Toggle' onClick={() => toggleExpandedArea()}>
        <p className='Label'>Message Parameters</p>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M0.266267 0.254166C0.621289 -0.0847221 1.19689 -0.0847221 1.55192 0.254166L5 3.54555L8.44808 0.254166C8.80311 -0.0847221 9.37871 -0.0847221 9.73373 0.254166C10.0888 0.593054 10.0888 1.1425 9.73373 1.48139L5 6L0.266267 1.48139C-0.0887555 1.1425 -0.0887555 0.593054 0.266267 0.254166Z"
            fill="#000000"
          />
        </svg>
      </div>
      { expanded &&
        <div className='Expanded'>
          <FormGroup controlId='message' bsSize='large'>
            <ControlLabel>Message</ControlLabel>
            <FormControl
              value={props.message}
              onChange={event => props.setMessage(event.target.value)}
            />
          </FormGroup>
          <FormGroup controlId='subject' bsSize='large'>
            <ControlLabel>Subject</ControlLabel>
            <FormControl
              value={props.subject}
              onChange={event => props.setSubject(event.target.value)}
            />
          </FormGroup>
          <div className='HtmlContainer'>
            <label htmlFor="htmlMessage">HTML Message</label>
            <textarea
              value={props.htmlMessage}
              onChange={event => props.setHtmlMessage(event.target.value)}
              className='Html'
              name="htmlMessage"
              id="htmlMessage"
            />
          </div>
        </div>
      }
    </div>
  )
}
