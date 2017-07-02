import React, { Component } from 'react'
import { Container, Divider, Segment, Grid, List, Label } from 'semantic-ui-react'
import 'isomorphic-fetch'

import CustomHead from '../components/CustomHead'
import TopMenu from '../components/TopMenu'
import NiceDate from '../components/NiceDate'

const sortCompareStates = (a, b) => {
  try {
    if (a['agent']['internal_id'] < b['agent']['internal_id']) {
      return -1;
    }
    if (a['agent']['internal_id'] > b['agent']['internal_id']) {
      return 1;
    }
    if (a['series']['internal_id'] < b['series']['internal_id']) {
      return -1;
    }
    if (a['series']['internal_id'] > b['series']['internal_id']) {
      return 1;
    }
  } catch (e) {
    console.error('Failed to compare:', e, a, b);
  }
  return 0;
}

const CSListing = (props) => {
  const states = Array.from(props.currentStates);
  states.sort(sortCompareStates);
  const items = [];
  var lastIternalAgentId = null;
  for (const state of states) {
    const internalAgentId = state['agent']['internal_id'];
    const internalSeriesId = state['series']['internal_id'];

    /*
    if (lastIternalAgentId != internalAgentId) {
      lastIternalAgentId = internalAgentId;
      items.push(<h3 key={'h' + internalAgentId}>Agent: {internalAgentId}</h3>);
    }
    */

    items.push((
      <div key={'s' + internalSeriesId}>

        <Grid columns={3} stackable>
          <Grid.Row columns={3}>

            <Grid.Column width={4}>

              <div className="cellTitle">Agent</div>
              <p>{internalAgentId}</p>

              <div className="cellTitle">Series</div>
              <p>{internalSeriesId}</p>

              <div className="cellTitle">Date</div>
              <p><NiceDate date={state['date']} /></p>

            </Grid.Column>

            <Grid.Column width={4}>
              <div className="cellTitle">Tags</div>
              <List bulleted>
                {state['tags'].map(({key, value}) => (
                  <List.Item key={key}>
                    {key}: <code>{JSON.stringify(value)}</code>
                  </List.Item>
                ))}
              </List>

            </Grid.Column>

            <Grid.Column width={8}>
              <div className="cellTitle">Values and checks</div>
              <List bulleted>
                {state['values'].map(({key, value}) => (
                  <List.Item key={'value_' + key}>
                    {key}: <code>{JSON.stringify(value)}</code>
                  </List.Item>
                ))}

                {state['checks'].map(({key, status}) => (
                  <List.Item key={'check_' + key}>
                    {key}: <Label color={status} horizontal size="small">{status}</Label>
                  </List.Item>
                ))}

                {state['expire_checks'].map(({key, deadline}) => (
                  <List.Item key={'expire_check_' + key}>
                    {key}: {
                      (new Date(deadline) > new Date())
                        ? (<Label horizontal color="green" size="small"><NiceDate date={deadline} /></Label>)
                        : (<Label horizontal color="red" size="small"><NiceDate date={deadline} /></Label>)
                    }
                  </List.Item>
                ))}

              </List>
            </Grid.Column>

          </Grid.Row>
        </Grid>

        <Divider />

      </div>
    ));

  }


  return (
    <div className="currentStateListing">
      {items}
      <br />
      <br />
      <br />
      <br />
      <br />
      <Segment compact color='teal'>
        <pre className="debug">{JSON.stringify(states, null, 2)}</pre>
      </Segment>
    </div>
  );
};

const CSLoading = () => (
  <p>Loading...</p>
);

class IndexPage extends Component {

  constructor(props) {
    super(props);
    this.fetchIntervalSeconds = 2;
    this.state = {
      currentStatesLoading: true,
      currentStates: [],
    };
  }

  componentDidMount() {
    this.doFetch = true;
    this.fetchCurrentStates();
  }

  componentWillUnmount() {
    this.doFetch = false;

  }

  fetchCurrentStates() {
    if (this.doFetch) {
      fetch('/api/hub/current-states').then((res) => res.json()).then((data) => {
        // console.debug('data:', data);
        this.setState({
          currentStatesLoading: false,
          currentStates: data['current_states'] || [],
        });
        setTimeout(() => { this.fetchCurrentStates(); }, this.fetchIntervalSeconds * 1000);
      });
    }
  }

  render() {
    const { currentStatesLoading, currentStates } = this.state;
    return (
      <div>
        <CustomHead />
        <TopMenu activeItem="states" />

        <Container>

          <h1>Current states</h1>

          {currentStatesLoading ? <CSLoading /> : <CSListing currentStates={currentStates} />}

        </Container>

      </div>
    )
  }

}

export default IndexPage;
