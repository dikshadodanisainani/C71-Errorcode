import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,Image,TextInput } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class BookTransactionScreen extends React.Component{
    constructor()
    {
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedData:'',
            scannedBookid:'',
            scannedStudentid:'',
            buttonState:'normal',
            transactionMessage : '',
        }
    }

    getCameraPermission=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);

        this.setState({
            hasCameraPermissions:status==="granted",
            buttonState:id,
            scanned:false
        });
    }
    handleBarCodeScanned = async({type, data})=>
    {
        const {buttonState} = this.state
  
        if(buttonState==="BookId")
        {
          this.setState({
            scanned: true,
            scannedBookid: data,
            buttonState: 'normal'
          });
        }
        else if(buttonState==="StudentId")
        {
          this.setState({
            scanned: true,
            scannedStudentid: data,
            buttonState: 'normal'
          });
        }
     }

     initiateBookIssue = async ()=>{
        //add a transaction
        db.collection("transaction").add({
          'studentId' : this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'data' : firebase.firestore.Timestamp.now().toDate(),
          'transactionType' : "Issue"
        })
    
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability' : false
        })
        //change number of issued books for student
        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
        })
    
        this.setState({
          scannedStudentId : '',
          scannedBookId: ''
        })
      }
    
      initiateBookReturn = async ()=>{
        //add a transaction
        db.collection("transactions").add({
          'studentId' : this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'date'   : firebase.firestore.Timestamp.now().toDate(),
          'transactionType' : "Return"
        })
    
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability' : true
        })
    
        //change book status
        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })
    
        this.setState({
          scannedStudentId : '',
          scannedBookId : ''
        })
      }
    
      handleTransaction = async()=>{
        var transactionMessage = null;
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
          var book = doc.data()
          if(book.bookAvailability){
            this.initiateBookIssue();
            transactionMessage = "Book Issued"
          }
          else{
            this.initiateBookReturn();
            transactionMessage = "Book Returned"
          }
        })
    
        this.setState({
          transactionMessage : transactionMessage
        })
      }
    
        handleTransaction=async()=>{
           
            db.collection("Books").doc(this.state.scannedBookid).get().then((doc)=>{
                console.log(doc.data());
            })
        }

    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;
        if(buttonState !=='normal'&&hasCameraPermissions){
            return(
                <BarCodeScanner onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}/>
            )
        }
        else if(buttonState==="normal")
        {
        return(
            <View style={styles.container}>
<View>
    <Image source={require("../assets/booklogo.jpg")}
    style={{width:200,height:200}}/>
    <Text style={{textAlign:'center',fontSize:30}}>Willy</Text>
</View>



                <View style={styles.inputView}>
               <TextInput style={styles.inputBox}
               placeholder="Book ID"
               value={this.state.scannedBookid}/>
                <TouchableOpacity style={styles.scanButton}
                onPress={()=>{
                    this.getCameraPermission("BookId");
                }}>
               
                    <Text style={styles.buttonText}>Scan </Text>
                </TouchableOpacity>
               </View>
               <View style={styles.inputView}>
               <TextInput style={styles.inputBox}
               placeholder="Student ID"
               value={this.state.scannedStudentid}/>
                <TouchableOpacity style={styles.scanButton}
                 onPress={()=>{
                    this.getCameraPermission("StudentId");
                }}>
               
                    <Text style={styles.buttonText}>Scan </Text>
                </TouchableOpacity>
               </View>
               <TouchableOpacity
               style={styles.submitButton}
               onPress={async()=>{await this.handleTransaction()}}>
                   <Text style={styles.submitButtonText}>Submit</Text>
               </TouchableOpacity>
            </View>
        );
    }}
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    displayText:{
        fontSize:15,
        textDecorationLine:'underline'
    },
    scanButton:{
        backgroundColor:'#66BB6A',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0,
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10,
    },
    inputView:{
        flexDirection:'row',
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20,
    },
submitButton:{
    backgroundColor:'#FBC02D',
    width:100,
    height:50
},
submitButtonText:{
    padding:10,
    textAlign:'center',
    fontSize:20,
    fontWeight:'bold',
    color:'white'
},
})