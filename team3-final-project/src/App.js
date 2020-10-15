import React, { Component } from 'react';
import './App.css';
import PickBan from './PickBan.js'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { DEFAULT_MIN_VERSION } from 'tls';
import { match } from 'assert';


class Name extends Component{
  render(){
    
    return(
      <div class = "name" onClick={()=>this.props.onClick(this.props.name)}>
        {this.props.name}
      </div>
    )
  }
}
class ChampNameList extends Component{
  render(){
    return(
      <div class = "champList">
        {this.props.champs.map(name => <Name name ={name} onClick={(e)=>this.props.onClickCallback(e)}/>)}
      </div>
    )
  }
}
// we could place this Todo component in a separate file, but it's
// small enough to alternatively just include it in our App.js file.

const ydoc = new Y.Doc()

// this allows you to instantly get the (cached) documents data
const indexeddbProvider = new IndexeddbPersistence('string-demo', ydoc)


// Sync clients with the y-webrtc provider.
const webrtcProvider = new WebrtcProvider('string-demo', ydoc)

//Sync clients with the y-websocket provider

const websocketProvider = new WebsocketProvider(
  'ws://localhost:1234', 'string-demo', ydoc
)
  
// main component
class App extends React.Component {
  constructor( props ) {
    super( props )
    // initialize our state
    
    let yjsArray;
    let yjsNum;

    //0, 2, 4, 6, 8 blue bans, 
    let selectionsArray = [];
    for (let i = 0; i<20;i++)
        selectionsArray.push("")

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const matchCode = urlParams.get('matchCode');
    let hasCode = false;
    if(matchCode){
      hasCode = true;
    }
    


    this.state = {obsSelections: yjsArray,
                  obsSelectNum : yjsNum,
                  selections   : selectionsArray,
                  selectionNumber: 0,
                  searchTerm: "",
                  hasRoom: hasCode,
                  roomCode: matchCode,
                  draftRole: -1, // -1 spectator, 0 blue side, 1 red side
                  hasRole: false, 
                  champNames: ['Aatrox','Ahri','Akali','Alistar','Amumu','Anivia','Annie','Aphelios','Ashe','AurelionSol','Azir','Bard','Blitzcrank','Brand','Braum','Caitlyn','Camille','Cassiopeia','Chogath','Corki','Darius','Diana','Draven','DrMundo','Ekko','Elise','Evelynn','Ezreal','FiddleSticks','Fiora','Fizz','Galio','Gangplank','Garen','Gnar','Gragas','Graves','Hecarim','Heimerdinger','Illaoi','Irelia','Ivern','Janna','JarvanIV','Jax','Jayce','Jhin','Jinx','Kaisa','Kalista','Karma','Karthus','Kassadin','Katarina','Kayle','Kennen','Khazix','Kindred','Kled','KogMaw','Leblanc','LeeSin','Leona','Lilia','Lissandra','Lucian','Lulu','Lux','Malphite','Malzahar','Maokai','MasterYi','MissFortune','MonkeyKing','Mordekaiser','Morgana','Nami','Nasus','Nautilus','Neeko','Nidalee','Nocturne','Nunu','Olaf','Orianna','Ornn','Pantheon','Poppy','Pyke','Qiyana','Quinn','Rakan','Rammus','RekSai','Renekton','Rengar','Riven','Rumble','Ryze','Samira','Sejuani','Senna','Sett','Shaco','Shen','Shyvana','Singed','Sion','Sivir','Skarner','Sona','Soraka','Swain','Sylas','Syndra','TahmKench','Taliyah','Talon','Taric','Teemo','Thresh','Tristana','Trundle','Tryndamere','TwistedFate','Twitch','Udyr','Urgot','Varus','Vayne','Veigar','Velkoz','Vi','Viktor','Vladimir','Volibear','Warwick','Xayah','Xerath','XinZhao','Yasuo','Yone','Yorick','Yummi','Zac','Zed','Ziggs','Zilean','Zoe','Zyra']
    }
    
  }

  componentDidMount(){
    if (this.state.hasRoom) { // will be false if match code is undefined
        let matchCode = this.state.roomCode
        let yjsArray = ydoc.getArray(matchCode + 'selections');
        let yjsNum   = ydoc.getMap  (matchCode + 'selectionNumber');

        // /this.setState({obsSelections:yjsArray, obsSelectNum:yjsNum});
        console.log("State set to yjsArray")
        
        indexeddbProvider.whenSynced.then(() => {
            console.log('Got data for match ' + matchCode)

            let role = yjsNum.get("draftRole")
            if (!this.state.hasRole){
                if (role === 0){ // if there is noone in draft, role is 0
                    yjsNum.set("draftRole", 1); // set role to be 1 for the next person
                }
                else if (role === 1){ // if there is one person already in draft
                    yjsNum.set("draftRole", -1); // then every following person is a spectator
                }

                this.setState({draftRole:role, hasRole:true});
            }
            console.log("My role is " + role);
            this.syncFromDB(yjsNum, yjsArray)

            yjsNum.observe(event => {
                this.syncFromDB(yjsNum, yjsArray);
            })
        })
    }  
  }

  syncFromDB(yjsNum, yjsArray){
    this.setState({obsSelections:yjsArray});
    this.setState({obsSelectNum:yjsNum})
    
    let tempSelections = this.state.selections;
    let tempSelectionNumber = yjsNum.get("selectNum");
    console.log("YJS num " + tempSelectionNumber)   
    console.log(yjsArray.toArray())
    
    for (let i=0; i<tempSelectionNumber+1; i++){
        tempSelections[i] = yjsArray.toArray()[i];
    }

    console.log(tempSelections)
        
    this.setState({selections:tempSelections});
    this.setState({selectionNumber : tempSelectionNumber});
  }


  clearYjsArray(){
    this.state.observable.delete(0, 20)
  }
  formatSelection(e){
    let str = e;
    this.selectChampion(str);
  }

  selectChampion(name){
    let tempSelections = this.state.selections;
    let tempSelectionNumber = this.state.obsSelectNum.get("selectNum")+1;

    tempSelections[tempSelectionNumber] = name;
    this.state.obsSelections.push([name])
    this.state.obsSelectNum.set("selectNum", tempSelectionNumber)

    this.setState({selections : tempSelections});
    this.setState({selectionNumber : tempSelectionNumber});
  }
  changeSearchTerm(e){
    this.setState({searchTerm: e.target.value});
  }
  updateList(){
    return this.state.champNames.filter(champ=>champ.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
  }
  checkCode(code){
    let newUrl = "/?matchCode="+code;
    window.location.replace(newUrl);
  }
  createCode(){
    let code = "";
    for (let i = 0; i < 5; i++){
      let num = Math.floor((Math.random() * 9)).toString();
      code = code + num;
    }

    // TODO Validate match num

    let tempArray = ydoc.getArray(code + 'selections');
    let tempNum   = ydoc.getMap  (code  + 'selectionNumber');

    tempNum.set("selectNum", -1) // initialize the the selection number
    tempNum.set("draftRole", 0) // init draft number to start at blue side
    tempArray.delete(0, tempArray.length) // ensure the array is empty

    console.log("code is "+ code);
    this.setState({roomCode: code});
  }
  // render component HTML using JSX 
  render() {
    //let sum = this.state.sum
    if(this.state.hasRoom){
      return (
        <div>
            <div class = "results">
                <div class = "team1">
                    <div class = "teamheader1">
                        <h1>Team 1</h1>
                        <h3>Picks</h3>
                    </div>
                    
                    <div class = "picks">
                        <div class = "pick">
                            <PickBan name={this.state.selections[6]}/>
                        </div>
                        <div class = "pick">
                            <PickBan name={this.state.selections[9]}/>
                        </div>
                        <div class = "pick">
                            <PickBan name={this.state.selections[10]}/> 
                        </div>
                        <div class = "pick">
                            <PickBan name={this.state.selections[17]}/>
                        </div>
                        <div class = "pick">
                            <PickBan name={this.state.selections[18]}/>
                        </div>
                    </div>
                    <h3>Bans</h3>
                    <div class = "bans">
                        <div class = "ban">
                            <PickBan name={this.state.selections[0]}/>
                        </div>
                        <div class = "ban">
                            <PickBan name={this.state.selections[2]}/>
                        </div>
                        <div class = "ban">
                            <PickBan name={this.state.selections[4]}/>
                        </div>
                        <div class = "ban">
                            <PickBan name={this.state.selections[13]}/>
                        </div>
                        <div class = "ban">
                            <PickBan name={this.state.selections[15]}/>
                        </div>
                    </div>
                </div>
                <div class = "team2">
                    <div class = "teamheader2">
                        <h1>Team 2</h1>
                        <h3>Picks</h3>
                    </div>
                    <div class = "picks">
                        <div class = "pick">
                            <PickBan name={this.state.selections[7]}/>
                        </div>
                        <div class = "pick">
                            <PickBan name={this.state.selections[8]}/>
                        </div>
                        <div class = "pick">
                            <PickBan name={this.state.selections[11]}/>
                        </div>
                        <div class = "pick">
                            <PickBan name={this.state.selections[16]}/>
                        </div>
                        <div class = "pick">
                            <PickBan name={this.state.selections[19]}/>
                        </div>
                    </div>
                    <h3>Bans</h3>
                    <div class = "bans">
                        
                        <div class = "ban">
                            <PickBan name={this.state.selections[1]}/>
                        </div>
                        <div class = "ban">
                            <PickBan name={this.state.selections[3]}/>
                        </div>
                        <div class = "ban">
                            <PickBan name={this.state.selections[5]}/>
                        </div>
                        <div class = "ban">
                            <PickBan name={this.state.selections[12]}/>
                        </div>
                        <div class = "ban">
                            <PickBan name={this.state.selections[14]}/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="selectionBox">
                <div class="input">
                <form>
                    <input id="champ" type="text" placeholder="SEARCH" value = {this.state.searchTerm} onChange = {(e)=>this.changeSearchTerm(e)}/>
                    <button type="submit" onClick = {(e)=>this.selectChampion(e)}>Select</button>
                </form>
                <br></br>
                <ChampNameList champs = {this.updateList()} onClickCallback={(e)=>this.selectChampion(e)}/>
                </div>
            </div>
        </div>
        )
    }
    else if(!this.state.hasRoom){
      return(
        <div>
          <div class = "hasCode">
            <h2>Input room Code</h2>
            <p>Enter the room code provided to you.</p>
            <div class = "entryBox">
                <form>
                    <input id="roomCode" type="text" placeholder="ROOM CODE"/>
                    <button type="button" onClick = {(e)=>this.checkCode(document.querySelector("#roomCode").value)}>Go to Room</button>
                </form>
                <br></br>
            </div>
          </div>
          <div class="needsCode">
              <h4>Create Room Code</h4>
              Don't have a code? Create one here.
              <div class="entryBox">
                  <form>
                      <button type="button" onClick = {()=>this.createCode()}>Create Room</button>
                  </form>
                  <p id="roomcode">{this.state.roomCode}</p>
              </div>
          </div>
    </div>
    )
    }
    
  }
}

export default App;
