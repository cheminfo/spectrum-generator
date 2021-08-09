# Changelog

## [4.8.0](https://www.github.com/cheminfo/spectrum-generator/compare/v4.7.1...v4.8.0) (2021-08-09)


### Features

* fixing usage of peak options close [#31](https://www.github.com/cheminfo/spectrum-generator/issues/31) ([#32](https://www.github.com/cheminfo/spectrum-generator/issues/32)) ([98bd1da](https://www.github.com/cheminfo/spectrum-generator/commit/98bd1daade4e21259d5aef0b31c722bd25e19564))
* typescript migration, add Spectrum2DGenerator ([#34](https://www.github.com/cheminfo/spectrum-generator/issues/34)) ([72907f8](https://www.github.com/cheminfo/spectrum-generator/commit/72907f83948f2c55ab649d4334eba7007f28a7bd))

### [4.7.1](https://www.github.com/cheminfo/spectrum-generator/compare/v4.7.0...v4.7.1) (2021-03-24)


### Bug Fixes

* update dependencies ([9c15b39](https://www.github.com/cheminfo/spectrum-generator/commit/9c15b39766f33bbbe497529e45da04f932268fbd))

## [4.7.0](https://www.github.com/cheminfo/spectrum-generator/compare/v4.6.0...v4.7.0) (2021-01-06)


### Features

* Use gaussian ration directly from peaks ([#28](https://www.github.com/cheminfo/spectrum-generator/issues/28)) ([36e1051](https://www.github.com/cheminfo/spectrum-generator/commit/36e1051171aa1bd59821f8d116dec81137231fc4))

## [4.6.0](https://www.github.com/cheminfo/spectrum-generator/compare/v4.5.0...v4.6.0) (2020-12-11)


### Features

* update ml-peak-shape-generator ([#26](https://www.github.com/cheminfo/spectrum-generator/issues/26)) ([c4c3a54](https://www.github.com/cheminfo/spectrum-generator/commit/c4c3a54782eb71b4c2eb9a280267f9f03180273c))

## [4.5.0](https://www.github.com/cheminfo/spectrum-generator/compare/v4.4.2...v4.5.0) (2020-12-10)


### Features

* Improve speed by calculating point to point the peak shape. ([#24](https://www.github.com/cheminfo/spectrum-generator/issues/24)) ([b987289](https://www.github.com/cheminfo/spectrum-generator/commit/b987289b4b8aa9b44a81366ad68d29c3650e692b))

### [4.4.2](https://www.github.com/cheminfo/spectrum-generator/compare/v4.4.1...v4.4.2) (2020-12-04)


### Bug Fixes

* correct some shapes imperfections ([eacf462](https://www.github.com/cheminfo/spectrum-generator/commit/eacf4628077939f7fec6894eb5e8966443feb76f))
* NaN bug ([17a5fc9](https://www.github.com/cheminfo/spectrum-generator/commit/17a5fc936be41339048898f6d13c2ef4c487f92b))

### [4.4.1](https://www.github.com/cheminfo/spectrum-generator/compare/v4.4.0...v4.4.1) (2020-11-18)


### Bug Fixes

* peak shape and package updates ([65dd5e7](https://www.github.com/cheminfo/spectrum-generator/commit/65dd5e77a4e98f60b402e65d8f8640c6fd6815dc))

## [4.4.0](https://www.github.com/cheminfo/spectrum-generator/compare/v4.3.0...v4.4.0) (2020-10-31)


### Features

* add cache for shape generation ([468e162](https://www.github.com/cheminfo/spectrum-generator/commit/468e16204f7befd5c7bef063d13d5d7761d63852))


### Bug Fixes

* bug with add peak and custom shapes ([6d712be](https://www.github.com/cheminfo/spectrum-generator/commit/6d712beca2f9985d3d60f62679fc6ee1d908bfc6))

## [4.3.0](https://www.github.com/cheminfo/spectrum-generator/compare/v4.2.0...v4.3.0) (2020-10-29)


### Features

* allow x,y,width objects to addPeak ([d3da510](https://www.github.com/cheminfo/spectrum-generator/commit/d3da5107fce78867e7ff59e9f6c611d49d69fd3a))


### Bug Fixes

* correct examples for typescript ([fa44388](https://www.github.com/cheminfo/spectrum-generator/commit/fa443880c0ff3f437c0c5228d127f652bf813a86))

## [4.2.0](https://www.github.com/cheminfo/spectrum-generator/compare/v4.1.2...v4.2.0) (2020-10-15)


### Features

* addPeaks accepts options ([e0d3bec](https://www.github.com/cheminfo/spectrum-generator/commit/e0d3bec4c9347b959471ba2cd2917b3251149afe))

### [4.1.2](https://www.github.com/cheminfo/spectrum-generator/compare/v4.1.1...v4.1.2) (2020-10-12)


### Bug Fixes

* documentation and close https://github.com/cheminfo/spectrum-generator/issues/14 ([0b70e44](https://www.github.com/cheminfo/spectrum-generator/commit/0b70e445ed29f01a17615d5e22e5f94832c27a51))

### [4.1.1](https://www.github.com/cheminfo/spectrum-generator/compare/v4.1.0...v4.1.1) (2020-10-12)


### Bug Fixes

* remove docs to force rebuild with github actions ([9e2c964](https://www.github.com/cheminfo/spectrum-generator/commit/9e2c964b2f8c5d20a8511d1ca18cab698f86993f))

## [4.1.0](https://github.com/cheminfo/spectrum-generator/compare/v4.0.2...v4.1.0) (2020-10-12)


### Features

* addPeaks with {x:[], y:[]} ([#11](https://github.com/cheminfo/spectrum-generator/issues/11)) ([3ac6f5e](https://github.com/cheminfo/spectrum-generator/commit/3ac6f5eb4f754a632fb1acd24890a1d08921de9a))

## [4.0.2](https://github.com/cheminfo/spectrum-generator/compare/v4.0.1...v4.0.2) (2020-04-18)


### Bug Fixes

* one more edge bug that leads to y=0 ([8bbca0f](https://github.com/cheminfo/spectrum-generator/commit/8bbca0fe8659290e15d413b6a8f2b28d071dd877))



## [4.0.1](https://github.com/cheminfo/spectrum-generator/compare/v4.0.0...v4.0.1) (2020-04-18)


### Bug Fixes

* example SpectrumGenerator ([cf49ce1](https://github.com/cheminfo/spectrum-generator/commit/cf49ce1db859e542bb6324006ed338546b4d390f))
* examples ([4a8289b](https://github.com/cheminfo/spectrum-generator/commit/4a8289bafc894d27158c7c4bbadc0d74f1c84206))
* rouding problem in spectrum generation yield to zero values ([fcb1521](https://github.com/cheminfo/spectrum-generator/commit/fcb1521014441290b345d758412c9922f714a156))



# [4.0.0](https://github.com/cheminfo/spectrum-generator/compare/v3.2.2...v4.0.0) (2020-03-18)



## [3.2.2](https://github.com/cheminfo/spectrum-generator/compare/v3.2.1...v3.2.2) (2020-03-13)


### Bug Fixes

* remove cheminfo-tools from dependencies ([5c17e1c](https://github.com/cheminfo/spectrum-generator/commit/5c17e1c2b48f50309fc0f3f23fd596221e33d86a))



## [3.2.1](https://github.com/cheminfo/spectrum-generator/compare/v3.2.0...v3.2.1) (2020-03-07)


### Bug Fixes

* ensure peak symmetry ([128def1](https://github.com/cheminfo/spectrum-generator/commit/128def19cf1932f1fd853bb6b983a91559022666))



# [3.2.0](https://github.com/cheminfo/spectrum-generator/compare/v3.1.3...v3.2.0) (2020-03-02)


### Features

* allow to specify the shape ([abb6a7d](https://github.com/cheminfo/spectrum-generator/commit/abb6a7df2cdbe198ae32162bb98765b2f66a0ae3))



# [3.1.0](https://github.com/cheminfo/spectrum-generator/compare/v3.0.1...v3.1.0) (2019-01-10)



<a name="3.0.1"></a>
## [3.0.1](https://github.com/cheminfo/spectrum-generator/compare/v3.0.0...v3.0.1) (2018-10-23)


### Bug Fixes

* **addPeak:** fix peak generation with non-integer middlepoint index ([#3](https://github.com/cheminfo/spectrum-generator/issues/3)) ([baf1a6e](https://github.com/cheminfo/spectrum-generator/commit/baf1a6e))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/cheminfo/spectrum-generator/compare/v2.0.1...v3.0.0) (2018-10-23)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/cheminfo/spectrum-generator/compare/v2.0.0...v2.0.1) (2018-08-03)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/cheminfo/spectrum-generator/compare/v1.1.0...v2.0.0) (2018-07-28)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/cheminfo/spectrum-generator/compare/v1.0.1...v1.1.0) (2018-03-12)



<a name="1.0.1"></a>
## [1.0.1](https://github.com/cheminfo/spectrum-generator/compare/v1.0.0...v1.0.1) (2018-03-09)


### Bug Fixes

* fix bug when start not 0 and pointsPerUnit not 1 ([a41d3db](https://github.com/cheminfo/spectrum-generator/commit/a41d3db))



<a name="1.0.0"></a>
# 1.0.0 (2017-11-09)


### Features

* implement spectrum generator ([6199252](https://github.com/cheminfo/spectrum-generator/commit/6199252))
