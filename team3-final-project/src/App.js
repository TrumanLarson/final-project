import React, { Component } from 'react';
import './App.css';
import PickBan from './PickBan.js'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { BrowserRouter, Route, Switch } from 'react-router-dom';


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
    const yjsArray = ydoc.getArray('selections')
    const yjsNum   = ydoc.getText('selectionNumber')
    //0, 2, 4, 6, 8 blue bans, 
    let selectionsArray = [];
    for (let i = 0; i<20;i++)
        selectionsArray.push("")
    let selectionsImagesArray = [];
     // ensures yjs array is empty
    for (let i = 0; i<20;i++)
        selectionsImagesArray.push("")
    this.state = {observable:yjsArray,
                  selections: selectionsArray,
                  selectionsImages: selectionsImagesArray,
                  selectionNumber: 0,
                  searchTerm: "",
                  hasRoom: 0,
                  roomCode: "",
                  champNames: ['Aatrox','Ahri','Akali','Alistar','Amumu','Anivia','Annie','Aphelios','Ashe','AurelionSol','Azir','Bard','Blitzcrank','Brand','Braum','Caitlyn','Camille','Cassiopeia','Chogath','Corki','Darius','Diana','Draven','DrMundo','Ekko','Elise','Evelynn','Ezreal','FiddleSticks','Fiora','Fizz','Galio','Gangplank','Garen','Gnar','Gragas','Graves','Hecarim','Heimerdinger','Illaoi','Irelia','Ivern','Janna','JarvanIV','Jax','Jayce','Jhin','Jinx','Kaisa','Kalista','Karma','Karthus','Kassadin','Katarina','Kayle','Kennen','Khazix','Kindred','Kled','KogMaw','Leblanc','LeeSin','Leona','Lilia','Lissandra','Lucian','Lulu','Lux','Malphite','Malzahar','Maokai','MasterYi','MissFortune','MonkeyKing','Mordekaiser','Morgana','Nami','Nasus','Nautilus','Neeko','Nidalee','Nocturne','Nunu','Olaf','Orianna','Ornn','Pantheon','Poppy','Pyke','Qiyana','Quinn','Rakan','Rammus','RekSai','Renekton','Rengar','Riven','Rumble','Ryze','Samira','Sejuani','Senna','Sett','Shaco','Shen','Shyvana','Singed','Sion','Sivir','Skarner','Sona','Soraka','Swain','Sylas','Syndra','TahmKench','Taliyah','Talon','Taric','Teemo','Thresh','Tristana','Trundle','Tryndamere','TwistedFate','Twitch','Udyr','Urgot','Varus','Vayne','Veigar','Velkoz','Vi','Viktor','Vladimir','Volibear','Warwick','Xayah','Xerath','XinZhao','Yasuo','Yone','Yorick','Yummi','Zac','Zed','Ziggs','Zilean','Zoe','Zyra']
                }
    console.log(yjsArray)
    //yjsArray.delete(0, yjsArray.length)
    indexeddbProvider.whenSynced.then(() => {
        console.log('loaded data from indexed db')
        
        yjsArray.delete(0, yjsArray.length)
        yjsArray.observe(event => {
            // print updates when the data changes
            this.setState({observable:yjsArray})
           
            let tempSelections = this.state.selections
            let tempSelectionsImages = this.state.selectionsImages;
            let tempSelectionNumber = this.state.selectionNumber;
            let name = yjsArray.toArray()[tempSelectionNumber]
            console.log("observe " + yjsArray.toArray()[tempSelectionNumber])
            tempSelections[tempSelectionNumber] = name;
            tempSelectionsImages[tempSelectionNumber] = "/champion/loading/"+name+"_0.jpg";
            this.setState({selections:tempSelections});
            this.setState({selectionsImages : tempSelectionsImages});
            this.setState({selectionNumber : ++tempSelectionNumber});
            //console.log(yarray)
          })
    })
    // array of numbers which produce a sum
    
    // this.setState({strings:yarray})
    // observe changes of the sum
    
  }

  clearYjsArray(){
    this.state.observable.delete(0, 20)
  }
  formatSelection(e){
    let str = e;
    this.selectChampion(str);
  }

  selectChampion(name){
    console.log("Picked "+name)
    let tempSelections = this.state.selections;
    let tempSelectionsImages = this.state.selectionsImages;
    let tempSelectionNumber = this.state.selectionNumber;
    tempSelections[tempSelectionNumber] = name;
    this.state.observable.push([name])
    tempSelectionsImages[tempSelectionNumber] = "/champion/loading/"+name+"_0.jpg";
    this.setState({selections:tempSelections});
    this.setState({selectionsImages : tempSelectionsImages});
    this.setState({selectionNumber : ++tempSelectionNumber});
    console.log(this.state.selectionNumber)
  }
  changeSearchTerm(e){
    this.setState({searchTerm: e.target.value});
  }
  updateList(){
    return this.state.champNames.filter(champ=>champ.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
  }
  checkCode(code){
    this.setState({hasRoom:1})
  }
  createCode(){
    let code = "";
    for (let i = 0; i < 5; i++){
      let num = Math.floor((Math.random() * 9)).toString();
      code = code + num;
    }
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
                          <PickBan image={this.state.selectionsImages[6]} name={this.state.selections[6]}/>
                      </div>
                      <div class = "pick">
                          <PickBan image={this.state.selectionsImages[9]} name={this.state.selections[9]}/>
                      </div>
                      <div class = "pick">
                          <PickBan image={this.state.selectionsImages[10]} name={this.state.selections[10]}/> 
                      </div>
                      <div class = "pick">
                          <PickBan image={this.state.selectionsImages[17]} name={this.state.selections[17]}/>
                      </div>
                      <div class = "pick">
                          <PickBan image={this.state.selectionsImages[18]} name={this.state.selections[18]}/>
                      </div>
                  </div>
                  <h3>Bans</h3>
                  <div class = "bans">
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[0]} name={this.state.selections[0]}/>
                      </div>
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[2]} name={this.state.selections[2]}/>
                      </div>
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[4]} name={this.state.selections[4]}/>
                      </div>
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[13]} name={this.state.selections[13]}/>
                      </div>
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[15]} name={this.state.selections[15]}/>
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
                          <PickBan image={this.state.selectionsImages[7]} name={this.state.selections[7]}/>
                      </div>
                      <div class = "pick">
                          <PickBan image={this.state.selectionsImages[8]} name={this.state.selections[8]}/>
                      </div>
                      <div class = "pick">
                          <PickBan image={this.state.selectionsImages[11]} name={this.state.selections[11]}/>
                      </div>
                      <div class = "pick">
                          <PickBan image={this.state.selectionsImages[16]} name={this.state.selections[16]}/>
                      </div>
                      <div class = "pick">
                          <PickBan image={this.state.selectionsImages[19]} name={this.state.selections[19]}/>
                      </div>
                  </div>
                  <h3>Bans</h3>
                  <div class = "bans">
                      
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[1]} name={this.state.selections[1]}/>
                      </div>
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[3]} name={this.state.selections[3]}/>
                      </div>
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[5]} name={this.state.selections[5]}/>
                      </div>
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[12]} name={this.state.selections[12]}/>
                      </div>
                      <div class = "ban">
                          <PickBan image={this.state.selectionsImages[14]} name={this.state.selections[14]}/>
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
                    <button type="submit" onClick = {(e)=>this.checkCode(e)}>Go to Room</button>
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
