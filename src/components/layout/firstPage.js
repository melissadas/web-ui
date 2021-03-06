import React from 'react';
import SearchBar from "../search/SearchBar";
import TableView from "../report/datasets/table/TableView";
import {Container, Row} from "reactstrap";
import axios from "../../../webservice/axios-dataSets";

class FirstPage extends React.Component {

    state = {
        searchDTO: {
            searchKey: "",
            searchIn: [],
            orderBy: {
                selectedOrderValue: "relevance"
            },
            filters: []
        },

        screenWidth: 0,

        dataSets: [],
        loadingDataSets: true,
        loadingDataSetsError: false,

        numberOfDataSets: 0,
        loadingNumberOfDataSets: true,
        loadingNumberOfDataSetsError: false,

        loadingFilters: true,
        loadingFiltersError: false,
    };

    componentDidMount = () => {
        this.handleWindowSizeChange();
        window.addEventListener('resize', this.handleWindowSizeChange);
    };

    onUpdateSearchKey = (searchKey) => {
        this.setState({
            searchDTO: {
                ...this.state.searchDTO,
                searchKey: searchKey
            }
        })
    };

    onSearchInChanged = (searchDomain) => {
        let newSelectedSearchIn = [...this.state.searchDTO.searchIn];
        if (newSelectedSearchIn.includes(searchDomain))
            newSelectedSearchIn = newSelectedSearchIn.filter(x => x !== searchDomain);
        else
            newSelectedSearchIn = newSelectedSearchIn.concat(searchDomain);
        this.setState({
            searchDTO: {
                ...this.state.searchDTO,
                searchIn: newSelectedSearchIn
            }
        });
    };

    onUpdatedSearchInRemoved = (searchDomain) => {
        let newSelectedSearchIn = [...this.state.searchDTO.searchIn];
        newSelectedSearchIn = newSelectedSearchIn.filter(x => x !== searchDomain);
        this.setState({
            searchDTO: {
                ...this.state.searchDTO,
                searchIn: newSelectedSearchIn
            }
        });
    };

    fetchFiltersList = () => {
        this.setState({
            /*searchDTO: {
                filters: []
            },*/
            loadingFilters: true,
            loadingFiltersError: false
        }, () => {
            const searchDTO = this.prepareSearchDTO();
            axios.post(`/filters/list`, searchDTO)
                .then(response => {
                        const filters = response.data.map(f => {
                            f.values.forEach(v => {
                                v.selected = {
                                    permanent: !!v.selected,
                                    temporary: !!v.selected
                                };
                            });
                            return f;
                        });

                        this.setState(
                            {
                                searchDTO: {
                                    ...this.state.searchDTO,
                                    filters: filters
                                },
                                loadingFilters: false,
                                loadingFiltersError: false
                            });
                    }
                ).catch(error => {
                this.setState({
                    searchDTO: {
                        ...this.state.searchDTO,
                        filters: []
                    },
                    loadingFilters: false,
                    loadingFiltersError: true
                });
            });
        });
    };

    prepareSearchDTO = () => {
        const searchDTO = JSON.parse(JSON.stringify(this.state.searchDTO));
        searchDTO.filters.forEach(filter => {
            filter.values.forEach(v => {
                v.selected = v.selected.permanent;
            });
        });
        return searchDTO;
    };


    appendSelectedValues = (selectedFilter) => {

        const filter = this.state.searchDTO.filters.find(f => f.filterGroupTitle === selectedFilter.filterGroupTitle);
        if (filter) {
            filter.values = filter.values.map(v => {
                v.selected.temporary = !!selectedFilter.values.find(sv => sv.value === v.value);
                return v;
            });
            const searchDTO = this.state.searchDTO;
            searchDTO.filters = searchDTO.filters.map(f => {
                if (f.filterGroupTitle === filter.filterGroupTitle) return filter;
                return f;
            });
            this.setState({searchDTO: searchDTO});
        }
    };

    getSearchDTO = () => {
        return this.prepareSearchDTO();
    };

    // todo change post opbject
    load10More = () => {
        if (this.state.dataSets !== null && this.state.dataSets.length > 0) {
            let url = `/dataSets/getSubList?low=${this.state.dataSets.length}`;
            const searchDTO = this.prepareSearchDTO();
            axios.post(url, searchDTO)
                .then(response => {
                    const dataSets = response.data;
                    let ds = [...this.state.dataSets];
                    ds = ds.concat(dataSets);
                    this.setState({
                        loadingDataSets: false,
                        loadingDataSetsError: false,
                        dataSets: ds
                    });
                })
                .catch(err => {
                    this.setState({
                        loadingDataSets: false,
                        loadingDataSetsError: true,
                        dataSets: []
                    });
                });
        }
    };

    getNumberOfDataSets = () => {
        this.setState({
            loadingNumberOfDataSets: true,
            loadingNumberOfDataSetsError: false
        });
        let url = `/dataSets/getNumberOfDataSets`;
        // todo handle timeout https://stackoverflow.com/questions/36690451/timeout-feature-in-the-axios-library-is-not-working
        const searchDTO = this.prepareSearchDTO();
        axios.post(url, searchDTO)
            .then(response => {
                const numberOfDataSets = response.data;
                this.setState({
                    loadingNumberOfDataSets: false,
                    loadingNumberOfDataSetsError: false,
                    numberOfDataSets: numberOfDataSets
                });
            })
            .catch(err => {
                this.setState({
                    loadingNumberOfDataSets: false,
                    loadingNumberOfDataSetsError: true,
                    numberOfDataSets: -1
                });
            });
    };

    fetchDataSets = () => {
        this.setState({
            loadingDataSets: true,
            loadingDataSetsError: false,
            dataSets: []
        });


        let url = `/dataSets/getSubList`;
        const searchDTO = this.prepareSearchDTO();
        axios.post(url, searchDTO)
            .then(response => {
                const dataSets = response.data;
                this.setState({
                    loadingDataSets: false,
                    loadingDataSetsError: false,
                    dataSets: dataSets
                });
            })
            .catch(err => {
                this.setState({
                    loadingDataSets: false,
                    loadingDataSetsError: true,
                    dataSets: []
                });
            });
    };

    refreshDataSets = () => {
        this.getNumberOfDataSets();
        this.fetchDataSets();
        this.fetchFiltersList();
    };

    orderByChanged = (orderByValue) => {
        const searchDTO = JSON.parse(JSON.stringify(this.state.searchDTO));
        searchDTO.orderBy = orderByValue;
        this.setState({
            searchDTO: searchDTO
        }, () => this.refreshDataSets())
    };

    handleWindowSizeChange = () => {
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    }

    applyFilters = () => {
        const searchDTO = JSON.parse(JSON.stringify(this.state.searchDTO));
        searchDTO.filters.forEach(filter => {
            filter.values.forEach(v => v.selected.permanent = v.selected.temporary)
        });
        this.setState({searchDTO: searchDTO}, this.refreshDataSets);
    };

    clearFilters = () => {
        const searchDTO = JSON.parse(JSON.stringify(this.state.searchDTO));
        searchDTO.filters.forEach(filter => {
            filter.values.forEach(v => v.selected = {
                permanent: false,
                temporary: false
            })
        });
        this.setState({searchDTO: searchDTO}, this.refreshDataSets);
    };

    render() {
        return (
            <Container fluid>
                <br/>
                <Row>
                    <SearchBar
                        onFetchingDataSets={() => this.fetchDataSets()}
                        onGettingNumberOfDataSets={() => this.getNumberOfDataSets()}
                        onUpdatedSearchInRemoved={(domain) => this.onUpdatedSearchInRemoved(domain)}
                        onSearchInChanged={(domain) => this.onSearchInChanged(domain)}
                        onUpdateSearchKey={(searchKey) => this.onUpdateSearchKey(searchKey)}
                        selectedSearchIn={this.state.searchDTO.searchIn}
                        onFetchFilters={() => this.fetchFiltersList()}
                        clearFilters={this.clearFilters}
                    />
                </Row>
                <br/>
                <Row>
                    <TableView
                        fetchDataSets={() => this.fetchDataSets()}
                        getNumberOfDataSets={() => this.getNumberOfDataSets()}
                        load10More={() => this.load10More()}
                        dataSets={this.state.dataSets}
                        numberOfDataSets={this.state.numberOfDataSets}
                        loadingNumberOfDataSets={this.state.loadingNumberOfDataSets}
                        loadingNumberOfDataSetsError={this.state.loadingNumberOfDataSetsError}
                        loadingDataSets={this.state.loadingDataSets}
                        loadingDataSetsError={this.state.loadingDataSetsError}
                        appendSelectedValues={(selectedFilter) => this.appendSelectedValues(selectedFilter)}
                        getSearchDTO={this.getSearchDTO}
                        fetchFiltersList={() => this.fetchFiltersList()}
                        filters={this.state.searchDTO.filters}
                        loadingFilters={this.state.loadingFilters}
                        loadingFiltersError={this.state.loadingFiltersError}
                        getSelectedSearchIn={() => this.getSelectedSearchIn()}
                        isLocationAccessDenied={this.state.isLocationAccessDenied}
                        orderByChanged={this.orderByChanged}
                        applyFilters={this.applyFilters}
                    />
                </Row>
            </Container>
        );
    }
}

export default FirstPage;