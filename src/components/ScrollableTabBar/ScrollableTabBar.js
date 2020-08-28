/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-return-assign */
import React from 'react';

import { array, func, node, number, object, shape, string } from 'prop-types';
import { Animated, ScrollView, Text, TouchableOpacity, View, ViewPropTypes } from 'react-native';

import { constants } from '../../constants';
import styles from './ScrollableTabBar.styles';

const UNDERLINE_PADDING = 16;

class ScrollableTabBar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.currentXPosition = 0;
    this.state = {
      tabUnderlineWidth: props.tabs.map((_) => 0)
    };
  }

  componentDidUpdate(prevProps) {
    const { activeTab } = this.props;
    if (prevProps.activeTab !== activeTab) {
      this.scrollToTab(activeTab);
    }
  }

  adjustPrevious = (page) => {
    const lastHidden = Math.floor(this.currentXPosition / (constants.deviceWidth * 0.3));
    if (page <= lastHidden) {
      this.currentXPosition = constants.deviceWidth * 0.3 * page;
      this.scrollView.scrollTo({
        x: this.currentXPosition
      });
    }
  };

  adjustNext = (page) => {
    // eslint-disable-next-line max-len
    const invisibleX = constants.deviceWidth + this.currentXPosition - constants.deviceWidth * 0.3 * (page + 1);

    if (invisibleX < 0) {
      this.currentXPosition -= invisibleX;
      this.scrollView.scrollTo({
        x: this.currentXPosition
      });
    }
  };

  scrollToTab = (page) => {
    const { tabs } = this.props;

    if (tabs.length > 3) {
      if (page === 0) {
        this.scrollView.scrollTo({
          x: 0
        });
        this.currentXPosition = 0;
      } else if (page !== tabs.length - 1) {
        this.adjustPrevious(page - 1);
        this.adjustNext(page + 1);
      } else {
        this.scrollView.scrollToEnd();
        this.currentXPosition = constants.deviceWidth * 0.3 * tabs.length - constants.deviceWidth;
      }
    }
  };

  goToPage = (page) => {
    const { goToPage } = this.props;
    this.scrollToTab(page);

    return goToPage(page);
  };

  render() {
    const {
      activeTab,
      scrollValue,
      tabs,
      tabTextStyle,
      tabTextActiveStyle,
      tabTextContainerStyle,
      tabTextContainerActiveStyle,
      tabsContainerBackgroundColor,
      tabWrapperStyle,
      tabsContainerStyle,
      TabWrapper
    } = this.props;
    const { tabUnderlineWidth } = this.state;

    const tabWidth = tabs.length > 3 ? constants.deviceWidth * 0.3 : constants.deviceWidth * 0.33;

    const tabUnderlineStyle = {
      position: 'absolute',
      width: tabUnderlineWidth[activeTab] + 2 * UNDERLINE_PADDING,
      marginLeft: (tabWidth - tabUnderlineWidth[activeTab] - 2 * UNDERLINE_PADDING) / 2,
      marginRight: (tabWidth - tabUnderlineWidth[activeTab] - 2 * UNDERLINE_PADDING) / 2,
      bottom: 0,
      borderRadius: 6,
      height: 3
    };

    const translateX = scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, tabWidth]
    });

    const TabChildren = () => (
      <ScrollView
        style={styles.nestedStyle}
        contentContainerStyle={[styles.contentContainer, tabsContainerStyle]}
        ref={(r) => (this.scrollView = r)}
        onScrollEndDrag={(event) => (this.currentXPosition = event.nativeEvent.contentOffset.x)}
        vertical={false}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map(({ title, tab }, page) => {
          const isTabActive = activeTab === page;

          return (
            <TouchableOpacity
              key={title}
              accessible
              style={tabWrapperStyle}
              accessibilityLabel={title}
              accessibilityTraits="button"
              activeOpacity={0.9}
              onPress={() => this.goToPage(page)}
            >
              <View style={[styles.tabContainer, tabTextContainerStyle, isTabActive && tabTextContainerActiveStyle]}>
                {!title ? (
                  tab
                ) : (
                  <Text
                    onLayout={({
                      nativeEvent: {
                        layout: { width }
                      }
                    }) => {
                      const newWidth = [...tabUnderlineWidth];
                      newWidth[page] = width;
                      this.setState({ tabUnderlineWidth: newWidth });
                    }}
                    style={[styles.tabText, tabTextStyle, isTabActive && tabTextActiveStyle]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[
            tabUnderlineStyle,
            {
              transform: [
                {
                  translateX
                }
              ]
            }
          ]}
        />
      </ScrollView>
    );

    return (
      <>
        {TabWrapper ? (
          <TabWrapper>
            <TabChildren />
          </TabWrapper>
        ) : (
          <View
            style={[
              styles.container,
              {
                backgroundColor: tabsContainerBackgroundColor
              }
            ]}
          >
            <TabChildren />
          </View>
        )}
      </>
    );
  }
}

ScrollableTabBar.propTypes = {
  activeTab: number,
  goToPage: func,
  scrollValue: object,
  tabs: array,
  tabTextStyle: shape({}),
  tabTextActiveStyle: shape({}),
  tabTextContainerStyle: shape({}),
  tabTextContainerActiveStyle: shape({}),
  tabsContainerBackgroundColor: string,
  tabWrapperStyle: ViewPropTypes.style,
  tabsContainerStyle: ViewPropTypes.style,
  TabWrapper: node
};
export default ScrollableTabBar;
