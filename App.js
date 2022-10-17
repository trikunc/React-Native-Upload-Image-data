/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
// import type { Node } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
// const axios = require('axios');

const createFormData = (imageCamera, body = {}) => {
  const data = new FormData();

  data.append('file', {
    name: imageCamera.fileName,
    type: imageCamera.type,
    uri: Platform.OS === 'ios' ? imageCamera.uri.replace('file://', '') : imageCamera.uri,
  });

  Object.keys(body).forEach((key) => {
    data.append(key, body[key]);
  });

  return data;
};

const App = () => {
  const [imageCamera, setImageCamera] = useState(null);
  const [Latitude, setLatitude] = useState();
  const [Longitude, setLongitude] = useState();
  const [dataFetch, setDataFetch] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // const urlFetch = 'http://192.168.8.166:8080';
  const urlFetch = 'http://10.6.172.16:8080';

  const getData = async () => {
    try {
      const response = await fetch(`${urlFetch}/api/getSingleFile/1`);
      const json = await response.json();
      console.log('dataFetch =', json);
      setDataFetch(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;

      setLatitude(lat);
      setLongitude(long);

      getData();

    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchCamera(options, (res) => {
      if (res.didCancel) {
        console.log('User canceled image');
      } else if (res.errorCode) {
        console.log(res.errorMessage);
      } else {
        const data = res.assets[0];
        setImageCamera(data);
        console.log(data);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (res) => {
      if (res.didCancel) {
        console.log('User canceled image');
      } else if (res.errorCode) {
        console.log(res.errorMessage);
      } else {
        const data = res.assets[0];
        setImageCamera(data);
      }
    });
  };


  const saveImage = async (e) => {

    setLoading(true);
    const imgUrl = await fetch(`${urlFetch}/api/upload`, {
      method: 'POST',
      body: createFormData(imageCamera, { userId: '1' }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log('response', response);
        return response;
      })
      .catch((error) => {
        console.log('error', error.message);
        throw error;
      });

    try {
      await axios.put(`${urlFetch}/api/singleFile/${dataFetch.id}`, {
        email: dataFetch.email,
        name: dataFetch.name,
        filePath: imageCamera ? imgUrl : '',
        longitude: `${Longitude}`,
        latitude: `${Latitude}`,
      });

      getData();
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={styles.container}
        >
          {dataFetch != null &&
            <View style={{ ...styles.card, backgroundColor: 'skyblue' }}>
              <Text>Image from Back End</Text>
              <Image source={{ uri: `${urlFetch}/uploads/${dataFetch.filePath}` }} style={styles.image} />
              <View>
                <Text>Latitude: {dataFetch.latitude}</Text>
                <Text>Longitde: {dataFetch.longitude}</Text>
              </View>
            </View>

          }
          <View style={{ ...styles.card }}>
            <Text>Take Image</Text>

            {imageCamera != null &&
              <Image source={{ uri: imageCamera.uri }} style={styles.image} />

            }

            {Latitude != null &&
              <View>
                <Text>Latitude: {Latitude}</Text>
                <Text>Longitde: {Longitude}</Text>

              </View>
            }
            <TouchableOpacity style={styles.button} onPress={openCamera}>
              <Text style={styles.textWhite}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={openGallery}>
              <Text style={styles.textWhite}>Open Gallery</Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity style={{ ...styles.button, borderRadius: 12 }} onPress={saveImage}>
            <Text style={{ ...styles.textWhite, fontSize: 24 }}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  card: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    padding: 10,
    margin: 10,
    backgroundColor: 'green',
    color: 'white',
  },
  textWhite: {
    color: 'white',
  },
  image: {
    height: 100,
    width: 100,
  },



});

export default App;
