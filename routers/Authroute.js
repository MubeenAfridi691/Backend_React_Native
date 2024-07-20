const router = require('express').Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const user = require('../model/user');
require('dotenv').config();
const jwt = require('jsonwebtoken');

router.use(bodyParser.json());

async function sendVerificationEmail(email, verificationCode) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mubeenafridi691@Gmail.com',
                pass: process.env.NODEMAILER
            }
        });

        let info = await transporter.sendMail({
            from: 'TikTok',
            to: email,
            subject: 'Verification Code',
            text: `Your verification code is ${verificationCode}`,
            html: `<b>Your verification code is ${verificationCode}</b>`
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Propagate the error to handle it in the caller function
    }
}

router.post('/verify', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    try {
        const savedUser = await user.findOne({email });

        if (savedUser) {
            return res.status(222).json({
                message: "User already exists with this email"
            });
        }

        // Generate verification code
        let verificationCode = Math.floor(100000 + Math.random() * 900000);

        // Send verification email
        await sendVerificationEmail(email, verificationCode);

        // Log verification code (for debugging purposes)
        console.log("Verification code:", verificationCode);

        // Respond with success
        res.status(200).json({
            message: "Verification code sent to your email",verificationCode
        });

    } catch (error) {
        console.error("Error in /verify route:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});


router.post('/changeunername', async (req, res) => {
    const { email,username } = req.body;

    user.findOne({username}).then(async(savedUser)=>{
        if(savedUser){
            return res.status(222).json({
                message: "User already exists with this username"
            });
        }else{
            res.status(200).json({
                message: "Username changed successfully"
            });
        }
    })

})
router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;
  
    console.log("Received signup request:", { email, username });
  
    if (!email || !username || !password) {
      return res.status(400).json({
        message: "Email, username, and password are required"
      });
    }
  
    try {
      // Create a new User document using the User model
      const newUser = new user({
        email,
        username,
        password
      });
  
      // Save the new user to the database
      await newUser.save();
  
      console.log("User saved successfully");
  
      // Generate JWT token for the new user
      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET);
  
      // Respond with success message and token
      return res.status(200).json({
        message: "User created successfully",
        token
      });
    } catch (error) {
      console.error("Error saving user:", error);
      return res.status(500).json({
        message: "Failed to save user"
      });
    }
  });

// router.post('/signup', async (req, res) => {
//     const { email, username, password } = req.body;
  
//     console.log("Received signup request:", { email, username });
  
//     if (!email || !username || !password) {
//       return res.status(400).json({
//         message: "Email, username, and password are required"
//       });
//     }
  
//     const User = new user({
//       email,
//       username,
//       password
//     });
  
//     try {
//       console.log("Attempting to save user:", user);
//       await User.save();
//       console.log("User saved successfully");
  
//       const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  
//       return res.status(200).json({
//         message: "User created successfully",
//         token
//       });
//     } catch (error) {
//       console.error("Error saving user:", error);
//       return res.status(500).json({
//         message: "Failed to save user"
//       });
//     }
//   });
  




// forget password
router.post('/verifyp', async (req, res) => {
    const { email } = req.body;
    let verificationCode;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    try {
        const savedUser = await user.findOne({email: email});

       if (!savedUser) {
            return res.status(222 ).json({
                message: "User does not exist with this email"
            });
        }else{
            try {
                let verificationCode = Math.floor(100000 + Math.random() * 900000);
                await sendVerificationEmail(email, verificationCode);
                res.status(200).json({
                    message: "Verification code sent to your email",verificationCode
                });


            } catch (error) {
                console.error("Error in /verify route:", error);
                res.status(500).json({
                    message: "Internal Server Error"
                });
                
            }
        }
        console.log("Verification code:", verificationCode);
  

    } catch (error) {
        console.error("Error in /verify route:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

// change password
router.post('/changepassword', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const savedUser = await user.findOne({ email: email });

        if (savedUser) {
            savedUser.password = password;
            await savedUser.save(); // Await the save operation

            res.status(200).json({
                message: "Password changed successfully"
            });
        } else {
            res.status(222).json({
                message: "User does not exist with this email"
            });
        }
    } catch (error) {
        console.error("Error in /changepassword route:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

// login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const savedUser = await user.findOne({ email: email });

        if (!savedUser) {
            return res.status(222).json({
                message: "User does not exist with this email"
            });
        }


        // Compare passwords (plain text comparison - not recommended for production)
        if (password === savedUser.password) {
            // Passwords match, generate JWT token
            const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
            const { username,_id,email,profile_pic } = savedUser;

            res.status(200).json({
                message: "Login successful",
                token,user:({username,_id,email,profile_pic})
            });
        } else {
            // Passwords do not match
            res.status(222).json({
                message: "Incorrect password"
            });
        }
    } catch (error) {
        console.error("Error in /login route:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});


router.post('/userdata', async (req, res) => {
    const { email } = req.body;

    // Attempt to find a user with the given email
    const data = await user.findOne({ email: email });

    // Check if user data was found
    if (!data) {
        // If user is not found, return a 400 error response
        return res.status(400).json({
            message: "User does not exist with this email"
        });
    } else {
        // If user is found, return a 200 success response with user data
        res.status(200).json({
            message: "User data",
             data
        });
    }
});


// router.post('/userdata', async (req, res) => {
//     const { Authorization } = req.headers;
//     if (!Authorization) {
//         return res.status(401).json({
//             message: "Unauthorized"
//         });
//     }

//     // Extract token from Authorization header
//     const token = Authorization.replace("Bearer ", "");
    
//     // Verify JWT token
//     jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
//         if (err) {
//             return res.status(401).json({
//                 message: "Unauthorized"
//             });
//         }
        
//         // Token is valid, extract user id from payload
//         const { _id } = payload;
        
//         // Find user by id
//         user.findById(_id)
//             .then(userdata => {
//                 if (!userdata) {
//                     return res.status(404).json({
//                         message: "User not found"
//                     });
//                 }
//                 res.status(200).json(userdata);
//             })
//             .catch(err => {
//                 console.error("Error finding user by id:", err);
//                 res.status(500).json({
//                     message: "Internal Server Error"
//                 });
//             });
//     });
// });

router.post('/change', async (req, res) => {
    const {password,newpassword,email } = req.body;
if(!email){
    return res.status(400).json({
        message: "email is required"
    });
}
user.findOne({email:email}).then(async(savedUser)=>{
    if(savedUser){
        if(savedUser.password==password){
        savedUser.password=newpassword
        await savedUser.save()}
        res.status(200).json({
            message: "Password changed successfully"
        });
    }else{
        res.status(222).json({
            message: "Password does not match"
        });
    }
})
})


router.post('/changeusername', async (req, res) => {
    const { email, username } = req.body;

    // Check if username is provided
    if (!username) {
        return res.status(400).json({
            message: "Username is required"
        });
    }

    try {
        // Check if the username already exists
        const existingUser = await user.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        // Find the user by email and update the username
        const savedUser = await user.findOne({ email: email });
        if (savedUser) {
            savedUser.username = username;
            await savedUser.save();
            return res.status(200).json({
                message: "Username changed successfully"
            });
        } else {
            return res.status(404).json({
                message: "User does not exist with this email"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post('/setdescription', async (req, res) => {
    const { email, description } = req.body;
    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    try {
        const savedUser = await user.findOne({ email: email });
        if (savedUser) {
            savedUser.description = description;
            await savedUser.save();
            res.status(200).json({
                message: "Description changed successfully"
            });
        } else {
            res.status(404).json({
                message: "User does not exist with this email"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})


router.post('/searchuser', (req, res) => {
    const { keyword } = req.body;

    if (!keyword) {
        return res.status(422).json({ error: "Please search a username" });
    }

    user.find({ username: { $regex: keyword, $options: 'i' } })
        .then(user => {
            // console.log(user);
            let data = [];
            user.map(item => {
                data.push(
                    {
                        _id: item._id,
                        username: item.username,
                        email: item.email,
                        description: item.description,
                        profilepic: item.profilepic
                    }
                )
            })

            // console.log(data);
            if (data.length == 0) {
                return res.status(422).json({ error: "No User Found" });
            }
            res.status(200).send({ message: "User Found", user: data });

        })
        .catch(err => {
            res.status(422).json({ error: "Server Error" });
        })
})



module.exports = router;
