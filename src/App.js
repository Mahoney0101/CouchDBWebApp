import React,{Component} from 'react';
import logo from './logo.svg';
import './App.css';

async function update(){
    var PouchDB = require('pouchdb').default;
    var db = new PouchDB('http://admin:admin@localhost:5984/bugs');
    let data=[];
    await db.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      data=result.rows;    
    }).catch(function (err) {
      console.log(err);
    });
    let mappedBugs = data.map(bug =>
      <button key={bug.doc._id} id={bug.doc._id} type="button" name="buttons" className="wideButt" onClick={()=>autoFill(bug.doc.name, bug.doc._id,bug.doc.issue)}>
        {bug.doc.name}
      </button>)
    return mappedBugs;
  }

function clearForm(){
  document.getElementById("description").value = "";
  document.getElementById("description").name = 0;
  document.getElementById("issue").value = "";
}

function autoFill(evtName,evtId,evtIssue){
  document.getElementById("description").value = evtName;
  document.getElementById("description").name = evtId;
  document.getElementById("issue").value = evtIssue;
}

const remove = async(setUpdate) =>{
  try{
    let id = document.getElementById("description").name;
    var PouchDB = require('pouchdb').default;
    var db = new PouchDB('http://admin:admin@localhost:5984/bugs');
    db.get(id).then(async function (doc) {
      doc._deleted = true;
      await db.put(doc);
      setUpdate();
      clearForm();
  });
}
  catch(err){
    console.log(err);
  }
}

export default class App extends Component {
  constructor(props) {
		super(props)
    this.createdb = this.createdb.bind(this);
    this.setUpdate = this.setUpdate.bind(this);

		this.state = {
      buttns:"",
      update:0
		};
  }

 async setUpdate(){
    let updated = await update();
    this.setState({buttns:updated});
    clearForm();
  }

  async createdb(){
    let that = this;
    let data=7;
    var PouchDB = require('pouchdb').default;
    var db = new PouchDB('http://admin:admin@localhost:5984/bugs');
    await db.info().then(function (info) {
      data=info;
    });  
    let id = document.getElementById("description").name;
    if(id==="0"){
      id = (data.doc_count+data.doc_del_count+1).toString();
      let doc = {
        _id : id,
        name: document.getElementById("description").value,
        issue: document.getElementById("issue").value
      }; 
      try{
      await db.put(doc);
      document.getElementById("description").name = doc._id;
      let updated = await update();
      that.setUpdate(updated);
      }
      catch{
        console.log("Database Error. Record not saved");
      }
    }
    else{
    try{
      db.get(id).then(async function (doc) {
        doc.name = document.getElementById("description").value;
        doc.issue = document.getElementById("issue").value;
        await db.put(doc); 
        let updated = await update();
        that.setUpdate(updated);
      }).then(function () {
        return db.get(id);
      }).then(function (doc) {
        console.log(doc);
      });
    }
    catch(err){
      console.log(err);
    }
  }
}

mapReduce(){
  var PouchDB = require('pouchdb').default;
  var db = new PouchDB('http://admin:admin@localhost:5984/bugs');
  db.query('mapReduceCall/bug').then(function (res) {
    console.log(res);
  }).catch(function (err) {
    console.log(err);
  });
}

async componentDidMount(){
  let buts = await update();
  this.setState({buttns:buts})
}

  render(){
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Bug Logger
        </p>
        </header>
        <div id="lDiv" className="leftDiv">
        <div className="textCenter">Incident Report</div><br></br><br></br>
        <div className="leftMarg">
        Description<br></br>
        <input name="0" id="description" type="text" placeholder="bug description"></input><br></br>
        Issue<br></br>
        <textarea id="issue" rows={5} cols={32}></textarea><br></br><br></br>
        <button onClick={this.createdb}>Log new bug</button>
        <button onClick={this.createdb}>Update bug</button><br></br>
        <button onClick={()=>{remove(this.setUpdate)}}>Remove bug</button>
        <button onClick={this.mapReduce}>Show UIbugs</button>
      </div>
      </div>
       <div id="rightDivision" className="rightDiv">{this.state.buttns}</div>
    </div>    
  );
  }
}