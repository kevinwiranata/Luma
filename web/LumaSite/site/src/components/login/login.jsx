import React from "react";
import loginImg from "../../doctor.png";

export class Login extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
        <div className="base-container" ref={this.props.containerRef}>
          <div className="header">Login</div>
          <div className="content">
            <div className="image">
              <img src={loginImg} />
            </div>
            <div className="form">
              <form method = "POST" action = "http://foo.com">
                <div className="form-group">
                    <label for="ID">ID</label>
                    <input type="text" name="ID" placeholder="ID" id = "ID"/>
                </div>
                <div className="form-group">
                    <label for="Password">Password</label>
                    <input type="text" name="Password" placeholder="Password" id = "Password"/>
                </div>
              </form>
            </div>
          </div>
          <div className="footer">
            <button type="button" className="btn">
              Login
            </button>
          </div>
        </div>
      );
    }
  }