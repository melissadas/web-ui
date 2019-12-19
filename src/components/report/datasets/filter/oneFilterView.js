import React from 'react';
import {Button} from "reactstrap";
import CustomSelect from './customSelect';

import {FaAngleDown, FaAngleRight} from 'react-icons/fa'

class OneFilterView extends React.Component {

    state = {
        isExpanded: false
    };

    toggleFilterExpanded = () => {
        const isExpanded = !this.state.isExpanded;
        this.setState({ isExpanded: isExpanded });
    };


    render() {
        const extendedFilter = this.props.filter;
        extendedFilter.values = extendedFilter.values.map(v => {
            v.externalLink = extendedFilter.externalLink;
            return v;
        });

        return (
            <div>
                <div style={{ display: 'flex', flexFlow: 'row' }}>
                    <Button onClick={this.toggleFilterExpanded} style={{ flexGrow: 1, textAlign: 'left' }}>
                        {this.state.isExpanded ? <FaAngleDown /> : <FaAngleRight />}
                        {this.props.filter.title}
                    </Button>
                </div>
                {
                    this.state.isExpanded &&
                    <CustomSelect
                        filter={extendedFilter}
                        getSelectedSearchIn={this.props.getSelectedSearchIn}
                        selectedValues={this.props.selectedFilterValues}
                        appendSelectedValues={this.props.appendSelectedValues}
                        getSearchKey={this.props.getSearchKey}
                    />
                }
            </div>
        );
    }
};

export default OneFilterView;