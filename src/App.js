import React, { useState, useEffect } from 'react'
import './App.css'
import { FormControl, Select, MenuItem, Card, CardContent} from '@material-ui/core'
import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import {sortData, prettyPrintStat} from './util'
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css"

function App() {

  const [countries,setCountries] = useState([])
  const [country,setCountry] = useState('worldwide') 
  const [countryInfo,setCountryInfo] = useState({})
  const [tableData,setTableData] = useState([])
  const [mapCenter,setMapCenter] = useState({lat: 34.80746,lng: -40.4796})
  const [mapZoom,setMapZoom] = useState(3)
  const [mapCountries,setMapCountries] = useState([])
  const [casesType,setCasesType] = useState('cases')

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all').then(response => response.json()).then(data => {
      setCountryInfo(data)
    })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries').then((response) => response.json()).then((data => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))
        const sortedData = sortData(data)
        setTableData(sortedData)
        setMapCountries(data)
        setCountries(countries)
      }))
    }
    getCountriesData()
  }, [])
  
  const onCountryChange = async (e) => {
    const countryCode = e.target.value
    setCountry(countryCode)
    
    const url = countryCode ==='worldwide' ? 'https://disease.sh/v3/covid-19/all': `https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url).then(response => response.json()).then(data => {
      setCountry(countryCode)
      setCountryInfo(data)
      setMapCenter([data.countryInfo.lat,data.countryInfo.long])
      setMapZoom(4)
    })
  }

  return (
    <div className="app">
      <div className = 'app_left'>
        <div className = 'app_header'>
          <h1>COVID-19 TRACKER</h1>
          <FormControl className = 'app_dropdown'>
            <Select variant = 'outlined' onChange = {onCountryChange} value = {country}>
              <MenuItem value = 'worldwide'>WorldWide</MenuItem>
              {
                countries.map( (country) => (
                <MenuItem value = {country.value}>{country.name}</MenuItem>
                ))
              }
              {/* <MenuItem value = 'worldwide'>Worldwide</MenuItem>
              <MenuItem value = 'worldwide'>Worldwide</MenuItem>
              <MenuItem value = 'worldwide'>Worldwide</MenuItem>
              <MenuItem value = 'worldwide'>Worldwide</MenuItem> */}
            </Select>
          </FormControl>
        </div>
        <div className = 'app_stats'>
          <InfoBox isRed active = {casesType === 'cases'} title = 'CoronaVirus Cases' cases = {prettyPrintStat(countryInfo.todayCases)} total = {countryInfo.cases} onClick = {(e) => setCasesType('cases')}/>
          <InfoBox active = {casesType === 'recovered'} title = 'Recovered' cases = {prettyPrintStat(countryInfo.todayRecovered)} total = {countryInfo.recovered} onClick = {(e) => setCasesType('recovered')}/>
          <InfoBox isRed active = {casesType === 'deaths'} title = 'Deaths' cases = {prettyPrintStat(countryInfo.todayDeaths)} total = {countryInfo.deaths} onClick = {(e) => setCasesType('deaths')}/>
        </div>
        <Map className = 'app_map' casesType = {casesType} countries = {mapCountries} center = {mapCenter} zoom = {mapZoom}/>
      </div>
      <Card className = 'app_right'>
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries = {tableData}/>
          <h3 className = 'graph_title'>WorldWide new {casesType}</h3>
          <LineGraph className = 'app_graph' casesType = {casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
