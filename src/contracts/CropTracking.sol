// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CropTracking {
    struct Crop {
        string cropId;
        address farmer;
        address currentHandler;
        string status;
        uint256 timestamp;
        string metadataHash;
        bool exists;
    }

    struct JourneyStep {
        address handler;
        string status;
        string location;
        uint256 timestamp;
        string notes;
        string metadataHash;
    }

    struct User {
        string role; // farmer, distributor, retailer
        bool registered;
        uint256 registrationTime;
    }

    mapping(string => Crop) public crops;
    mapping(string => JourneyStep[]) public cropJourneys;
    mapping(address => User) public users;
    
    string[] public allCropIds;
    
    event CropAdded(
        string indexed cropId,
        address indexed farmer,
        uint256 timestamp,
        string metadataHash
    );
    
    event CropTransferred(
        string indexed cropId,
        address indexed from,
        address indexed to,
        string status,
        uint256 timestamp
    );
    
    event JourneyUpdated(
        string indexed cropId,
        address indexed handler,
        string status,
        uint256 timestamp
    );
    
    event UserRegistered(
        address indexed user,
        string role,
        uint256 timestamp
    );

    modifier onlyRegistered() {
        require(users[msg.sender].registered, "User not registered");
        _;
    }

    modifier cropExists(string memory _cropId) {
        require(crops[_cropId].exists, "Crop does not exist");
        _;
    }

    modifier onlyCurrentHandler(string memory _cropId) {
        require(
            crops[_cropId].currentHandler == msg.sender || 
            crops[_cropId].farmer == msg.sender,
            "Not authorized to handle this crop"
        );
        _;
    }

    function registerUser(string memory _role) external {
        require(!users[msg.sender].registered, "User already registered");
        require(
            keccak256(bytes(_role)) == keccak256(bytes("farmer")) ||
            keccak256(bytes(_role)) == keccak256(bytes("distributor")) ||
            keccak256(bytes(_role)) == keccak256(bytes("retailer")),
            "Invalid role"
        );

        users[msg.sender] = User({
            role: _role,
            registered: true,
            registrationTime: block.timestamp
        });

        emit UserRegistered(msg.sender, _role, block.timestamp);
    }

    function addCrop(
        string memory _cropId,
        string memory _metadataHash
    ) external onlyRegistered {
        require(!crops[_cropId].exists, "Crop already exists");
        require(
            keccak256(bytes(users[msg.sender].role)) == keccak256(bytes("farmer")),
            "Only farmers can add crops"
        );

        crops[_cropId] = Crop({
            cropId: _cropId,
            farmer: msg.sender,
            currentHandler: msg.sender,
            status: "harvested",
            timestamp: block.timestamp,
            metadataHash: _metadataHash,
            exists: true
        });

        // Add initial journey step
        cropJourneys[_cropId].push(JourneyStep({
            handler: msg.sender,
            status: "harvested",
            location: "Farm",
            timestamp: block.timestamp,
            notes: "Crop harvested and added to blockchain",
            metadataHash: _metadataHash
        }));

        allCropIds.push(_cropId);

        emit CropAdded(_cropId, msg.sender, block.timestamp, _metadataHash);
        emit JourneyUpdated(_cropId, msg.sender, "harvested", block.timestamp);
    }

    function updateCropStatus(
        string memory _cropId,
        string memory _status,
        string memory _location,
        string memory _notes
    ) external onlyRegistered cropExists(_cropId) onlyCurrentHandler(_cropId) {
        crops[_cropId].status = _status;
        crops[_cropId].timestamp = block.timestamp;

        cropJourneys[_cropId].push(JourneyStep({
            handler: msg.sender,
            status: _status,
            location: _location,
            timestamp: block.timestamp,
            notes: _notes,
            metadataHash: ""
        }));

        emit JourneyUpdated(_cropId, msg.sender, _status, block.timestamp);
    }

    function transferCrop(
        string memory _cropId,
        address _newHandler,
        string memory _status,
        string memory _location,
        string memory _notes
    ) external onlyRegistered cropExists(_cropId) onlyCurrentHandler(_cropId) {
        require(users[_newHandler].registered, "New handler not registered");
        require(_newHandler != msg.sender, "Cannot transfer to self");

        address previousHandler = crops[_cropId].currentHandler;
        
        crops[_cropId].currentHandler = _newHandler;
        crops[_cropId].status = _status;
        crops[_cropId].timestamp = block.timestamp;

        cropJourneys[_cropId].push(JourneyStep({
            handler: _newHandler,
            status: _status,
            location: _location,
            timestamp: block.timestamp,
            notes: _notes,
            metadataHash: ""
        }));

        emit CropTransferred(_cropId, previousHandler, _newHandler, _status, block.timestamp);
        emit JourneyUpdated(_cropId, _newHandler, _status, block.timestamp);
    }

    function getCrop(string memory _cropId) external view returns (
        string memory,
        address,
        address,
        string memory,
        uint256,
        string memory
    ) {
        require(crops[_cropId].exists, "Crop does not exist");
        Crop memory crop = crops[_cropId];
        return (
            crop.cropId,
            crop.farmer,
            crop.currentHandler,
            crop.status,
            crop.timestamp,
            crop.metadataHash
        );
    }

    function getCropJourney(string memory _cropId) external view returns (JourneyStep[] memory) {
        require(crops[_cropId].exists, "Crop does not exist");
        return cropJourneys[_cropId];
    }

    function getUserInfo(address _user) external view returns (string memory, bool, uint256) {
        User memory user = users[_user];
        return (user.role, user.registered, user.registrationTime);
    }

    function getAllCrops() external view returns (string[] memory) {
        return allCropIds;
    }

    function getCropCount() external view returns (uint256) {
        return allCropIds.length;
    }
}